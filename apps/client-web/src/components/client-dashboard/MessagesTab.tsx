import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MessageCircle } from 'lucide-react';

export function MessagesTab() {
  return (
    <div className="space-y-6">
      <Card className="border-[#23B685]/20">
        <CardHeader>
          <CardTitle className="text-[#243E36] flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            Messages from Coaches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-[#23B685]/5 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-[#23B685] rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-[#243E36]">
                      Coach Sarah
                    </h4>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Emma did fantastic in today's session! She's really
                    improving her coordination and showing great enthusiasm.
                    Keep up the excellent work! 🌟
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-[#243E36] rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-[#243E36]">Coach Mike</h4>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Great progress on the obstacle course! Emma's confidence is
                    growing with each session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}