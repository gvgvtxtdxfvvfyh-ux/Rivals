import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DBData {
  [key: string]: any[];
}

export default function AdminDBPage() {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState("users");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSQL, setShowSQL] = useState(false);
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [newTableName, setNewTableName] = useState("");

  const tables = ["users", "lectures", "dpps", "school_lessons", "chat_messages", "streaks", "lecture_completions", "dpp_completions", "school_lesson_completions", "battle_info"];

  const { data: allData, isLoading } = useQuery<DBData>({
    queryKey: ["/api/admin/db/all"],
  });

  const { data: dbSize } = useQuery<any>({
    queryKey: ["/api/admin/db/size"],
  });

  const deleteRowMutation = useMutation({
    mutationFn: async (data: { table: string; id: string }) => {
      return await apiRequest("DELETE", `/api/admin/db/${data.table}/${data.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/db/all"] });
      toast({ title: "Deleted" });
    },
  });

  const updateRowMutation = useMutation({
    mutationFn: async (data: { table: string; id: string; values: any }) => {
      return await apiRequest("PATCH", `/api/admin/db/${data.table}/${data.id}`, data.values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/db/all"] });
      setEditingId(null);
      toast({ title: "Updated" });
    },
  });

  const clearTableMutation = useMutation({
    mutationFn: async (table: string) => {
      if (window.confirm(`Delete all data from ${table}?`)) {
        return await apiRequest("DELETE", `/api/admin/db/${table}`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/db/all"] });
      toast({ title: "Cleared" });
    },
  });

  const dropTableMutation = useMutation({
    mutationFn: async (table: string) => {
      if (window.confirm(`Drop table "${table}"? This cannot be undone!`)) {
        return await apiRequest("DELETE", `/api/admin/db/drop/${table}`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/db/all"] });
      setSelectedTable("users");
      toast({ title: "Table dropped" });
    },
  });

  const executeSqlMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest("POST", "/api/admin/db/query", { query });
    },
    onSuccess: (result) => {
      setSqlResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/db/all"] });
      toast({ title: "Executed" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error?.message || "Query failed",
        variant: "destructive"
      });
    },
  });

  if (isLoading || !allData) {
    return <Skeleton className="h-96" />;
  }

  const currentTableData = allData[selectedTable] || [];
  const columns = currentTableData.length > 0 ? Object.keys(currentTableData[0]) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Database</h1>
          {dbSize && (
            <p className="text-sm text-muted-foreground mt-1">
              Size: <span className="font-mono font-semibold">{dbSize.formatted}</span>
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowSQL(!showSQL)}
          className="gap-2"
        >
          <Code className="w-4 h-4" />
          SQL
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-80">
              <div className="space-y-1">
                {tables.map((table) => (
                  <button
                    key={table}
                    onClick={() => setSelectedTable(table)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedTable === table
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{table}</span>
                      <span className="text-xs opacity-75">
                        {(allData[table] || []).length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Create Table</p>
              <div className="flex gap-2">
                <Input
                  placeholder="table_name"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (newTableName) {
                      executeSqlMutation.mutate(
                        `CREATE TABLE IF NOT EXISTS ${newTableName} (id TEXT PRIMARY KEY)`
                      );
                      setNewTableName("");
                    }
                  }}
                  className="h-8"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use SQL tab to define columns
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 flex-wrap gap-2">
            <div>
              <CardTitle className="capitalize text-lg">{selectedTable}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {currentTableData.length} row{currentTableData.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearTableMutation.mutate(selectedTable)}
              >
                Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => dropTableMutation.mutate(selectedTable)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Drop
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentTableData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <ScrollArea className="w-full">
                <div className="space-y-2">
                  {currentTableData.map((row: any) => (
                    <div
                      key={row.id}
                      className="border rounded-lg p-3 space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      {editingId === row.id ? (
                        <>
                          <div className="space-y-2">
                            {columns.map((col) => (
                              <div key={col} className="grid grid-cols-3 gap-2 items-center text-xs">
                                <span className="font-medium text-muted-foreground">{col}</span>
                                <Input
                                  defaultValue={row[col] || ""}
                                  onChange={(e) => {
                                    row[col] = e.target.value;
                                  }}
                                  className="col-span-2 h-7"
                                  data-testid={`input-edit-${col}`}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateRowMutation.mutate({
                                  table: selectedTable,
                                  id: row.id,
                                  values: row,
                                })
                              }
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            {columns.map((col) => (
                              <div key={col} className="grid grid-cols-3 gap-2 text-xs">
                                <span className="text-muted-foreground">{col}</span>
                                <span className="col-span-2 font-mono break-all">
                                  {typeof row[col] === "string" ? row[col] : JSON.stringify(row[col])}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2 border-t pt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(row.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                deleteRowMutation.mutate({
                                  table: selectedTable,
                                  id: row.id,
                                })
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {showSQL && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Execute SQL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="CREATE TABLE my_table (id TEXT, name TEXT);
INSERT INTO users VALUES ('1', 'John');
ALTER TABLE lectures ADD COLUMN new_col TEXT;"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="font-mono text-xs"
              rows={5}
            />
            <Button
              onClick={() => executeSqlMutation.mutate(sqlQuery)}
              disabled={!sqlQuery.trim()}
            >
              Execute
            </Button>

            {sqlResult && (
              <div className="bg-muted p-3 rounded text-xs space-y-2 max-h-48 overflow-auto">
                <pre className="font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(sqlResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
