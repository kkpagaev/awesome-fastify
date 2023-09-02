import * as fs from "fs"
import { join } from "path"
import { CreatePluginConfiguration, createPlugin } from "./createPlugin"
import { FastifyPluginAsync, HTTPMethods, RouteOptions } from "fastify"

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
    url: "/" + url.replace(/\[([a-zA-Z]+)\]/g, ":$1"),
    method: method as HTTPMethods,
  }
}

export async function autoRoute(
  path: string,
  prefix = ""
): Promise<CreatePluginConfiguration> {
  const config: CreatePluginConfiguration = {
    plugins: [],
    routes: [],
    prefix: prefix,
  }
  const files = fs.readdirSync(path)
  for (const file of files) {
    const fullPath = join(path, file)
    if (isDirectory(fullPath)) {
      const nestedPlugin = await autoRoute(fullPath, file)

      config.plugins?.push(nestedPlugin)
    } else {
      const route = await import(fullPath)

      if (!("default" in route)) {
        console.error(
          `ERROR importing ${fullPath}/${file} route no export default`
        )
        continue
      }
      const routeOptions: RouteOptions = route.default

      const { url, method } = parseFileName(file)
      routeOptions.url = url
      routeOptions.method = method

      config.routes?.push(routeOptions)
    }
  }

  return config
}
