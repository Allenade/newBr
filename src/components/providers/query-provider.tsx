"use client"

import React, {FC} from "react"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

type ComponentProps = {
    children: React.ReactNode
}

// ~ ======= Create client instance ======= ~
export const queryClient = new QueryClient()

const QueryProvider: FC<ComponentProps> = ({children}) => {
    return <QueryClientProvider client={queryClient}> {children}
    <ReactQueryDevtools/></QueryClientProvider>
}

export default QueryProvider