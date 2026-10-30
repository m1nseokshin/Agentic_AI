import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AI_DRAFT_NOTICE } from '@/lib/contest'
import { cn } from '@/lib/utils'

export default function AiDraftNotice({ className }: { className?: string }) {
  return (
    <Alert className={cn(className)}>
      <Info className="h-4 w-4" />
      <AlertDescription>{AI_DRAFT_NOTICE}</AlertDescription>
    </Alert>
  )
}
