import { MessagesProvider } from "@contexts/Messages";
import { LeadsProvider } from "@contexts/Leads";
import { LeadsProvider as RhProvider } from "@contexts/Rh";
import { FunnelProvider } from "@contexts/Funnel";
import { SalesProvider } from "@contexts/Sales";
import type { ReactNode } from "react";
import { OperationGroupProvider } from "@contexts/OperationGroup";
import { LeadChatsProvider } from "@contexts/LeadChatsContext";
import { HrMessagesProvider } from "@contexts/HrMessages";
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MessagesProvider>
      <LeadsProvider>
        <RhProvider>
          <FunnelProvider>
            <SalesProvider>
              <OperationGroupProvider>
                <LeadChatsProvider>
                 
                  <HrMessagesProvider>
                    {children}
                  </HrMessagesProvider>
               
                </LeadChatsProvider>
              </OperationGroupProvider>
            </SalesProvider>
          </FunnelProvider>
        </RhProvider>
      </LeadsProvider>
    </MessagesProvider>
  );
}
