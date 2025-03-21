
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Database, Function as FunctionIcon, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TEST_MODE } from "@/utils/testMode";

const TestingDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingData, setPendingData] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [speechVersionsData, setSpeechVersionsData] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch pending form data
      const { data: pendingFormData, error: pendingError } = await supabase
        .from('pending_form_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (pendingError) throw pendingError;
      setPendingData(pendingFormData);

      // Fetch speech purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('speech_purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (purchasesError) throw purchasesError;
      setPurchasesData(purchasesData);

      // Fetch speech versions
      const { data: versionsData, error: versionsError } = await supabase
        .from('speech_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (versionsError) throw versionsError;
      setSpeechVersionsData(versionsData);

    } catch (error: any) {
      console.error("Error fetching test data:", error);
      setError(error.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (TEST_MODE) {
      fetchData();
    }
  }, []);

  if (!TEST_MODE) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatJsonPreview = (json: any) => {
    try {
      return JSON.stringify(json, null, 2).substring(0, 100) + "...";
    } catch (e) {
      return "Invalid JSON";
    }
  };

  return (
    <Card className="p-4 sm:p-6 my-8 max-w-full overflow-hidden bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Testing Dashboard</h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={fetchData} 
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="pending" className="flex-1">
            <Database className="w-4 h-4 mr-2" />
            Pending Form Data
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex-1">
            <Database className="w-4 h-4 mr-2" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="speeches" className="flex-1">
            <FunctionIcon className="w-4 h-4 mr-2" />
            Speech Versions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Form Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingData.length > 0 ? (
                  pendingData.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.id.substring(0, 8)}...</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.customer_email}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{formatDate(item.created_at)}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.processed ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        <pre className="text-xs">{formatJsonPreview(item.form_data)}</pre>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                      No pending form data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="purchases" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Speech Gen</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Emails Sent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchasesData.length > 0 ? (
                  purchasesData.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.id.substring(0, 8)}...</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.customer_reference}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.customer_email}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">${item.amount_paid}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.payment_status}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.speeches_generated ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.emails_sent ? "Yes" : "No"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-sm text-gray-500">
                      No purchase data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="speeches" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purchase ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tone</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Content Preview</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {speechVersionsData.length > 0 ? (
                  speechVersionsData.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.id.substring(0, 8)}...</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.purchase_id.substring(0, 8)}...</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.version_number}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{item.tone}</td>
                      <td className="px-3 py-2 text-xs text-gray-900">{formatDate(item.created_at)}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        <div className="max-w-xs truncate">{item.content.substring(0, 100)}...</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">
                      No speech version data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default TestingDashboard;
