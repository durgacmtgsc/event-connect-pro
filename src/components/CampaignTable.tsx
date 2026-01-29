import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { ModeBadge } from '@/components/ui/mode-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ChevronRight, 
  Megaphone, 
  Calendar,
  Users,
  Eye,
  Pause,
  Play,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CampaignTableProps {
  campaigns: Event[];
  onViewDetails: (campaign: Event) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  loading?: boolean;
}

export function CampaignTable({ 
  campaigns, 
  onViewDetails, 
  onPause, 
  onResume,
  loading 
}: CampaignTableProps) {
  const getProgress = (campaign: Event) => {
    if (!campaign.total_contacts) return 0;
    return Math.round(((campaign.sent_count || 0) + (campaign.failed_count || 0)) / campaign.total_contacts * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground">
              Create your first invitation campaign to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          All Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow 
                  key={campaign.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewDetails(campaign)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{campaign.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {campaign.message.substring(0, 50)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ModeBadge mode={campaign.mode} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={getProgress(campaign)} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {getProgress(campaign)}% complete
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {campaign.total_contacts}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(campaign.scheduled_time), 'PP')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(campaign);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {campaign.status === 'sending' && onPause && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onPause(campaign.id);
                          }}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {campaign.status === 'pending' && onResume && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onResume(campaign.id);
                          }}>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
