"use client";
import { toast } from "@/hooks/use-toast";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./pagination";
import { MedicalRecordForm } from "@/components/doctor/MedicalRecord/medical-form"
import { RecordDetailDialog } from "@/components/doctor/MedicalRecord/record-detail-dialog";
import { Filter, Search } from "lucide-react";
import { MedicalRecord } from "./columns";

// Simplified interface without generics
interface DataTableProps {
  columns: ColumnDef<MedicalRecord>[];
  data: MedicalRecord[];
  onAddRecord?: (record: Omit<MedicalRecord, "id">) => void;
}

export function DataTable({
  columns,
  data: initialData,
  onAddRecord,
}: DataTableProps) {
  const [data, setData] = React.useState<MedicalRecord[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedRecord, setSelectedRecord] = React.useState<MedicalRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);

  const handleAddRecord = (record: Omit<MedicalRecord, "id">) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: Date.now().toString(),
    };

    // Add to local state
    setData((prev) => [newRecord, ...prev]);

    // Call parent callback if provided
    if (onAddRecord) {
      onAddRecord(record);
    }

    console.log("New record added:", newRecord);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
        <MedicalRecordForm onAddRecord={handleAddRecord} />
      </div>

      {/* Search and Filter Card */}
      <div className="bg-card border-border border rounded-xl p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patient records..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-popover border-border text-popover-foreground"
            >
              <DropdownMenuCheckboxItem
                className="capitalize text-foreground focus:bg-accent focus:text-accent-foreground"
                checked={
                  table.getColumn("status")?.getFilterValue() === "Active"
                }
                onCheckedChange={(value) =>
                  table
                    .getColumn("status")
                    ?.setFilterValue(value ? "Active" : undefined)
                }
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="capitalize text-foreground focus:bg-accent focus:text-accent-foreground"
                checked={
                  table.getColumn("status")?.getFilterValue() === "Follow-up"
                }
                onCheckedChange={(value) =>
                  table
                    .getColumn("status")
                    ?.setFilterValue(value ? "Follow-up" : undefined)
                }
              >
                Follow-up
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="capitalize text-foreground focus:bg-accent focus:text-accent-foreground"
                checked={
                  table.getColumn("status")?.getFilterValue() === "Recovered"
                }
                onCheckedChange={(value) =>
                  table
                    .getColumn("status")
                    ?.setFilterValue(value ? "Recovered" : undefined)
                }
              >
                Recovered
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="capitalize text-foreground focus:bg-accent focus:text-accent-foreground"
                checked={
                  table.getColumn("status")?.getFilterValue() === "Inactive"
                }
                onCheckedChange={(value) =>
                  table
                    .getColumn("status")
                    ?.setFilterValue(value ? "Inactive" : undefined)
                }
              >
                Inactive
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border-border border rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-border"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-foreground font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-border hover:bg-accent/50 data-[state=selected]:bg-accent cursor-pointer"
                  onClick={() => {
                    setSelectedRecord(row.original);
                    setDetailDialogOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <DataTablePagination table={table} />
      </div>

      {/* Detail Dialog */}
      <RecordDetailDialog
        record={selectedRecord}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={(record) => {
          setDetailDialogOpen(false);
          toast({ title: "Edit Record", description: `Opening edit form for ${record.name}...` });
        }}
        onDownload={(record) => {
          toast({ title: "Download Started", description: `Downloading ${record.name}'s medical record...` });
        }}
      />
    </div>
  );
}
