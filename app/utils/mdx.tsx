import { getMDXComponent } from 'mdx-bundler/client/index.js'
import React from 'react'

function getMdxComponent(code: string) {
  const Component = getMDXComponent(code)

  function MdxComponent({
    components,
    ...rest
  }: Parameters<typeof Component>['0']) {
    return <Component components={{ ...components }} {...rest} />
  }

  return MdxComponent
}

export function useMdxComponent(code: string) {
  return React.useMemo(() => {
    const component = getMdxComponent(code)
    return component
  }, [code])
}
