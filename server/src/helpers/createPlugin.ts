import { FastifyPluginAsync, RouteOptions } from "fastify"

export type PluginModule = {
  plugin: FastifyPluginAsync
  prefix: string
}

export type CreatePluginConfiguration = {
  plugins?: PluginModule[]
  routes?: RouteOptions[]

  extend?: FastifyPluginAsync
}

export const createPlugin = ({
  plugins,
  routes,
  extend,
}: CreatePluginConfiguration): FastifyPluginAsync => {
  return async (fastify, opts) => {
    await Promise.all([
      plugins?.map(({ plugin, prefix }) =>
        fastify.register(plugin, { prefix })
      ),
      routes?.map((options) => fastify.route(options)),
      extend ? extend(fastify, opts) : Promise.resolve(),
    ])
  }
}
