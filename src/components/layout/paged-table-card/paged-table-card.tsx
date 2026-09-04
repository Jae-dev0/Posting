import {
  Card,
  CardContent,
  TablePagination,
  type TablePaginationProps,
} from '@mui/material'
import type { ReactNode } from 'react'

export type PagedTableCardProps = {
  children: ReactNode
  count: number
  page: number
  rowsPerPage: number
  onPageChange: TablePaginationProps['onPageChange']
  onRowsPerPageChange: TablePaginationProps['onRowsPerPageChange']
}

export function PagedTableCard({
  children,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PagedTableCardProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ '&:last-child': { pb: 1 } }}>
        {children}
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </CardContent>
    </Card>
  )
}
