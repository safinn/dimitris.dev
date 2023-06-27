import { getMDXComponent } from 'mdx-bundler/client/index.js'
import React from 'react'
import { AnchorOrLink } from './misc'

const mdxComponents = {
  a: AnchorOrLink,
}

function getMdxComponent(code: string) {
  const Component = getMDXComponent(code)

  function MdxComponent({
    components,
    ...rest
  }: Parameters<typeof Component>['0']) {
    return (
      // @ts-expect-error the types are wrong here
      <Component components={{ ...mdxComponents, ...components }} {...rest} />
    )
  }

  return MdxComponent
}

export function useMdxComponent(code: string) {
  return React.useMemo(() => {
    const component = getMdxComponent(code)
    return component
  }, [code])
}
