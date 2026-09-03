#!/bin/bash

# This script fixes the getTicketById calls to handle ToolResult properly

cat index.ts | awk '
BEGIN { in_get_ticket_block = 0; line_num = 0 }
{
    line_num++

    # Pattern 1: Around line 132
    if (line_num == 132 && /getTicketById/) {
        print "    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);"
        print ""
        print "    if (!ticketResult.success || !ticketResult.data) {"
        getline; getline # skip next 2 lines
        next
    }

    # Pattern 2: Around line 175
    if (line_num == 175 && /getTicketById/) {
        print "    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);"
        print ""
        print "    if (!ticketResult.success || !ticketResult.data) {"
        getline; getline # skip next 2 lines
        next
    }

    # Pattern 3: Around line 220
    if (line_num == 220 && /getTicketById/) {
        print "    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);"
        print ""
        print "    if (!ticketResult.success || !ticketResult.data) {"
        getline; getline # skip next 2 lines
        next
    }

    # Fix references to ticket.data -> ticketResult.data.data
    if (/res\.json\({/ && /ticket/) {
        gsub(/data: ticket/, "data: ticketResult.data")
    }

    print
}
' > index.ts.new && mv index.ts.new index.ts
