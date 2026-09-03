#!/usr/bin/env python3

with open('index.ts', 'r') as f:
    lines = f.readlines()

# Fix section 1: line ~138-142
for i in range(137, 143):
    if i < len(lines):
        lines[i] = lines[i].replace('data: ticket', 'data: ticketResult.data')

# Fix section 2: line ~181-187
for i in range(180, 188):
    if i < len(lines):
        # Fix the spread operator line
        if '{ ...ticket,' in lines[i]:
            lines[i] = lines[i].replace('{ ...ticket,', '{ ...ticketResult.data,')
        lines[i] = lines[i].replace('data: updatedTicket', 'data: updatedTicket')

# Fix section 3: line ~226-232
for i in range(225, 233):
    if i < len(lines):
        # Fix the spread operator line
        if '{ ...ticket,' in lines[i]:
            lines[i] = lines[i].replace('{ ...ticket,', '{ ...ticketResult.data,')

with open('index.ts', 'w') as f:
    f.writelines(lines)

print("Fixed ticket references")
