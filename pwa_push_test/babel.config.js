const presets = [
  [
    "@babel/env",
    {
      useBuiltIns: "usage",
      corejs: 3
    },
  ],

];

const plugins = [
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-proposal-private-methods"
]

module.exports = { presets, plugins };