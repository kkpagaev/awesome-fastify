import * as fs from "fs"
import { join } from "path"
import { CreatePluginConfiguration, createPlugin } from "./createPlugin"
import { FastifyPluginAsync, HTTPMethods } from "fastify"
import { CreateRouteOptionsGenerator } from "./createRoute"

function isDirectory(path: string): boolean {
  return fs.statSync(path).isDirectory()
}

const httpMethodsInFileName = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
]

function parseFileName(fileName: string): { url: string; method: HTTPMethods } {
  const tokens = fileName.split(".").filter((t) => t !== "ts")
  if (tokens.length == 1) {
    const token = tokens[0]

    if (httpMethodsInFileName.includes(token)) {
      return {
        url: "/",
        method: token as HTTPMethods,
      }
    }

    console.warn(`Creating GET route with name ${token}`)
    return {
      url: token,
      method: "GET",
    }
  }

  if (tokens.length > 2) {
    throw new Error(`invalid name for ${fileName}`)
  }
  const [url, method] = tokens

  if (!httpMethodsInFileName.includes(method)) {
    throw new Error(`invalid name for ${fileName}`)
  }

  return {
    url: url.replace(/\[([a-zA-Z]+)\]/g, ":$1"),
    method: "GET",
  }
}

export async function autoRoute(
  path: string,
  prefix = ""
): Promise<FastifyPluginAsync> {
  const config: CreatePluginConfiguration = {
    plugins: [],
    routes: [],
  }
  const files = fs.readdirSync(path)
  for (const file of files) {
    const fullPath = join(path, file)
    if (isDirectory(fullPath)) {
      const nestedPlugin = await autoRoute(fullPath, prefix + "/" + file)

      config.plugins?.push({
        plugin: nestedPlugin,
        prefix: file,
      })
    } else {
      const route = await import(fullPath)

      if (!("default" in route)) {
        console.error(
          `ERROR importing ${fullPath}/${file} route no export default`
        )
        continue
      }
      const routeGenerator: CreateRouteOptionsGenerator = route.default

      if (typeof routeGenerator !== "function") {
        console.error(
          `ERROR importing ${fullPath}/${file} route, it must export default createRoute`
        )
        continue
      }

      const { url, method } = parseFileName(file)

      config.routes?.push(routeGenerator(url, method))
    }
  }

  return createPlugin(config)
}
