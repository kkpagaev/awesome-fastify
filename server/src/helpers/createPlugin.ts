import { FastifyPluginAsync, RouteOptions } from "fastify"

export type CreatePluginConfiguration = {
  plugins?: CreatePluginConfiguration[]
  routes?: RouteOptions[]
  prefix: string
  extend?: FastifyPluginAsync
}

export const createPlugin = ({
  plugins,
  routes,
  extend,
}: CreatePluginConfiguration): FastifyPluginAsync => {
  return async (fastify, opts) => {
    await Promise.all([
      plugins?.map((plugin) =>
        fastify.register(createPlugin(plugin), { prefix: plugin.prefix })
      ),
      routes?.map((options) => fastify.route(options)),
      extend ? extend(fastify, opts) : Promise.resolve(),
    ])
  }
}
