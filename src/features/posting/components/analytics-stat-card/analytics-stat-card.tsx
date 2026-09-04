import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material'
import type { IconType } from 'react-icons'
import { LuArrowUpRight } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

export type AnalyticsStatCardProps = {
  label: string
  value: number
  href?: string
  icon: IconType
  accentColor: string
  subtitle?: string
}

export function AnalyticsStatCard({
  label,
  value,
  href,
  icon: Icon,
  accentColor,
  subtitle,
}: AnalyticsStatCardProps) {
  const content = (
    <CardContent
      sx={{
        p: 2.5,
        pl: 2.75,
        '&:last-child': { pb: 2.5 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: 2,
            bgcolor: alpha(accentColor, 0.12),
            color: accentColor,
            flexShrink: 0,
          }}
        >
          <Icon size={20} />
        </Box>
        {href ? (
          <Box
            sx={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.45,
              transition: 'opacity 0.2s, color 0.2s',
              '.MuiCard-root:hover &': { opacity: 1, color: accentColor },
            }}
          >
            <LuArrowUpRight size={18} />
          </Box>
        ) : null}
      </Box>

      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          mt: 2,
          mb: 0.25,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontSize: { xs: '1.75rem', md: '2rem' },
        }}
      >
        {value.toLocaleString()}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 0.75 }}>
        {label}
      </Typography>
      {subtitle ? (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 0.25 }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </CardContent>
  )

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `3px solid ${accentColor}`,
        bgcolor: 'background.paper',
        boxShadow: '0 1px 2px rgba(31, 32, 36, 0.04)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        ...(href
          ? {
              '&:hover': {
                borderColor: alpha(accentColor, 0.5),
                borderLeftColor: accentColor,
                boxShadow: `0 10px 28px ${alpha(accentColor, 0.14)}`,
                transform: 'translateY(-2px)',
              },
            }
          : {}),
      }}
    >
      {href ? (
        <CardActionArea
          component={RouterLink}
          to={href}
          sx={{
            height: '100%',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
          }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  )
}
