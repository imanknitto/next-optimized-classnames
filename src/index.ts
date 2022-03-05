import { join, relative } from "path";
import generateName from "css-class-generator";
import { NextConfig } from "next";
import { WebpackConfigContext } from "next/dist/server/config-shared";
import { Configuration } from "webpack";

const CSS_LOADER_MATCH = join("loaders", "css-loader", "src", "index.js");

const names = {};
let index = 0;

function getName(key: string) {
  return Object.prototype.hasOwnProperty.call(names, key)
    ? names[key]
    : (names[key] = generateName(index++));
}

function getKey({ rootContext, resourcePath }, name: string) {
  return `${relative(rootContext, resourcePath).replace(/\\+/g, "/")}#${name}`;
}

function getLocalIdent(path, _, name) {
  return getName(getKey(path, name));
}

function webpack(config: Configuration, { dev }: WebpackConfigContext) {
  if (dev) return config;

  for (const { oneOf } of config.module.rules as any) {
    if (Array.isArray(oneOf)) {
      for (const { sideEffects, use } of oneOf) {
        if (sideEffects === false && Array.isArray(use)) {
          for (const { loader, options } of use) {
            if (loader.endsWith(CSS_LOADER_MATCH) && typeof options.modules === "object") {
              options.modules.getLocalIdent = getLocalIdent;
            }
          }
        }
      }
    }
  }

  return config;
}

module.exports = function optimizeClassnames(nextConfig: NextConfig = {}): NextConfig {
  return {
    ...nextConfig,
    webpack(webpackConfig: Configuration, webpackOptions: WebpackConfigContext) {
      return webpack(
        typeof nextConfig.webpack === "function"
          ? nextConfig.webpack(webpackConfig, webpackOptions)
          : webpackConfig,
        webpackOptions,
      );
    },
  };
};
