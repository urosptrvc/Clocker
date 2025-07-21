import { Card, CardContent } from "@/components/ui/card"
import { Users, Timer, CheckCircle } from "lucide-react"
// import { formatDuration } from "@/lib/helper"

export function StatsOverview({ stats }) {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Ukupno korisnika</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Ukupno sesija</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/*<Card>*/}
        {/*  <CardContent className="p-6">*/}
        {/*    <div className="flex items-center gap-2">*/}
        {/*      <Clock className="h-5 w-5 text-primary" />*/}
        {/*      <div>*/}
        {/*        <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>*/}
        {/*        <div className="text-sm text-muted-foreground">Ukupno vremena</div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </CardContent>*/}
        {/*</Card>*/}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((stats.successfulAttempts / stats.totalAttempts) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Procenat uspeha</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
