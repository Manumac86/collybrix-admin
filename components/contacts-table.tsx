"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { contactsData } from "@/lib/data"
import { Search, Mail, Phone } from "lucide-react"

export function ContactsTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContacts = useMemo(() => {
    return contactsData.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.projectName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
        <p className="text-muted-foreground mt-2">Manage all your project contacts and stakeholders</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts by name, company, or project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
          <CardDescription>{filteredContacts.length} contacts found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Project</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Position</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Company</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{contact.name}</td>
                    <td className="py-3 px-4">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`tel:${contact.phoneNumber}`}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-4 h-4" />
                        {contact.phoneNumber}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{contact.projectName}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{contact.position}</td>
                    <td className="py-3 px-4 text-muted-foreground">{contact.company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
