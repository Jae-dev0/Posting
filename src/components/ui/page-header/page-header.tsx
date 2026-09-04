import {
  Box,
  type BoxProps,
  Button,
  type ButtonProps,
  Stack,
  type StackProps,
  Typography,
} from '@mui/material'
import type { Ref } from 'react'
import { MdAdd } from 'react-icons/md'

export type PageHeaderProps = BoxProps & {
  title?: string
  description?: string
  action?: ButtonProps
  stackProps?: StackProps
  ref?: Ref<HTMLDivElement>
}

export function PageHeader({
  title,
  description,
  action,
  stackProps = {},
  ref,
  ...rest
}: PageHeaderProps) {
  return (
    <Box {...rest} ref={ref}>
      <Stack
        spacing={2}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        {...stackProps}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            {title}
          </Typography>

          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Box>

        {action ? (
          <Button variant="contained" startIcon={<MdAdd />} {...action} />
        ) : null}
      </Stack>
    </Box>
  )
}
