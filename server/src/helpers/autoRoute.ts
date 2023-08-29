import * as fs from "fs"
import { join } from "path"
import { CreatePluginConfiguration, createPlugin } from "./createPlugin"
import { FastifyPluginAsync } from "fastify"

function isDirectory(path: string): boolean {
  return fs.statSync(path).isDirectory()
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

      config.routes?.push(route)
    }
  }

  return createPlugin(config)
}
