import { Box, Container, BoxProps as MuiBoxProps } from '@mui/material'
import { ReactNode, forwardRef } from 'react'

interface ContentSectionProps extends MuiBoxProps {
  children: ReactNode
  centered?: boolean
}

const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  ({ children, centered = false, ...rest }, ref) => {
    return (
      <Box {...rest} ref={ref}>
        {centered ? <Container maxWidth="lg">{children}</Container> : children}
      </Box>
    )
  },
)

ContentSection.displayName = 'ContentSection'

export { ContentSection, type ContentSectionProps }
