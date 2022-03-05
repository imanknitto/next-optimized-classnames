import { join, relative } from "path";
import generateName from "css-class-generator";
import _each from "lodash.foreach";
import { NextConfig } from "next";
import { WebpackConfigContext } from "next/dist/server/config-shared";
import { Configuration, RuleSetRule } from "webpack";

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
  if (!dev) {
    _each(config.module.rules, ({ oneOf }: RuleSetRule) => {
      if (Array.isArray(oneOf)) {
        _each(oneOf, ({ sideEffects, use }) => {
          if (sideEffects === false && Array.isArray(use)) {
            _each(use, ({ loader, options }: any) => {
              if (
                String(loader).endsWith(CSS_LOADER_MATCH) &&
                typeof options.modules === "object"
              ) {
                options.modules.getLocalIdent = getLocalIdent;
              }
            });
          }
        });
      }
    });
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
