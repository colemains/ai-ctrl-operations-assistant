#!/usr/bin/env python3

with open('index.ts', 'r') as f:
    lines = f.readlines()

# Fix line 132 (index 131)
if 'getTicketById(ticketId, authContext)' in lines[131]:
    lines[131] = '    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);\n'
    lines[132] = '\n'
    lines[133] = '    if (!ticketResult.success || !ticketResult.data) {\n'
    # Find the corresponding res.json with ticket and fix it
    for i in range(134, 145):
        if 'data: ticket' in lines[i]:
            lines[i] = lines[i].replace('data: ticket', 'data: ticketResult.data')

# Fix line 175 (index 174)
if 'getTicketById(ticketId, authContext)' in lines[174]:
    lines[174] = '    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);\n'
    lines[175] = '\n'
    lines[176] = '    if (!ticketResult.success || !ticketResult.data) {\n'
    for i in range(177, 188):
        if 'data: ticket' in lines[i]:
            lines[i] = lines[i].replace('data: ticket', 'data: ticketResult.data')

# Fix line 220 (index 219)
if 'getTicketById(ticketId, authContext)' in lines[219]:
    lines[219] = '    const ticketResult = await agent.ticketAdapter.getTicketById(ticketId, authContext);\n'
    lines[220] = '\n'
    lines[221] = '    if (!ticketResult.success || !ticketResult.data) {\n'
    for i in range(222, 233):
        if 'data: ticket' in lines[i]:
            lines[i] = lines[i].replace('data: ticket', 'data: ticketResult.data')

with open('index.ts', 'w') as f:
    f.writelines(lines)

print("Fixed getTicketById calls")
