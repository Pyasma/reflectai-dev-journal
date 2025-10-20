'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Repository {
  id: string;
  name: string;
  full_name: string;
}

interface FilterBarProps {
  repositories: Repository[];
  currentRepo: string;
  currentType: string;
  currentSearch: string;
  onRepoChange: (repoId: string) => void;
  onTypeChange: (type: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export function FilterBar({ 
  repositories,
  currentRepo,
  currentType,
  currentSearch,
  onRepoChange,
  onTypeChange,
  onSearchChange,
  onClearFilters
}: FilterBarProps) {
  const hasActiveFilters = currentRepo !== 'all' || currentType !== 'all' || currentSearch !== '';

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={currentSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Repository Filter */}
      <Select value={currentRepo} onValueChange={onRepoChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="All Repositories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Repositories</SelectItem>
          {repositories.map((repo) => (
            <SelectItem key={repo.id} value={repo.id}>
              {repo.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select value={currentType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="development">Development</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="planning">Planning</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
