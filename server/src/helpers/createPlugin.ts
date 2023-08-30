import { FastifyPluginAsync, RouteOptions } from "fastify"

export type PluginModule = {
  plugin: FastifyPluginAsync
  prefix: string
}

export type RouteModule =
  | {
      default: RouteOptions
    }
  | {
      options: RouteOptions
    }

export type CreatePluginConfiguration = {
  plugins?: PluginModule[]
  routes?: RouteModule[]

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
      routes?.map((options) =>
        "default" in options
          ? fastify.route(options.default)
          : fastify.route(options.options)
      ),
      extend ? extend(fastify, opts) : Promise.resolve(),
    ])
  }
}
