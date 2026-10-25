import { getCollections } from "@/api/endpoints/collections/collections";
import { getCustomers } from "@/api/endpoints/customers/customers";
import { getDeliveryReceipts } from "@/api/endpoints/delivery-receipts/delivery-receipts";
import { getInvoices } from "@/api/endpoints/invoices/invoices";
import { getPurchaseOrders } from "@/api/endpoints/purchase-orders/purchase-orders";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useHotkey } from "@tanstack/react-hotkeys";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useDebounce } from "use-debounce";

import entityToBadgeDelivery from "@/features/deliveries/lib/entity-to-badge";
import entityToBadgeInvoice from "@/features/invoices/lib/entity-to-badge";
import entityToBadgePurchaseOrder from "@/features/purchase-orders/lib/entity-to-badge";
import { Badge } from "../components/badge";

type SearchCommand = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export function SearchCommand({ open, setOpen }: SearchCommand) {
  function useGlobalSearch(search: string) {
    const params = { search, limit: 5 };
    const results = useQueries({
      queries: [
        {
          queryKey: ["customers", search],
          queryFn: () => getCustomers(params),
        },
        {
          queryKey: ["deliveries", search],
          queryFn: () => getDeliveryReceipts(params),
        },
        {
          queryKey: ["invoices", search],
          queryFn: () => getInvoices(params),
        },
        {
          queryKey: ["purchaseOrders", search],
          queryFn: () => getPurchaseOrders(params),
        },
        {
          queryKey: ["collections", search],
          queryFn: () => getCollections(params),
        },
      ],
    });

    const [customers, deliveries, invoices, purchaseOrders, collections] =
      results.map((r) => r.data);

    return {
      isLoading: results.some((result) => result.isLoading),
      customers,
      deliveries,
      invoices,
      purchaseOrders,
      collections,
    };
  }
  const navigate = useNavigate();

  useHotkey("Mod+S", (event) => {
    event.preventDefault();
    setOpen(true);
  });

  const [rawSearch, setSearch] = useState("");
  const [search] = useDebounce(rawSearch, 500);

  function changeStateOfCommandDialog(isOpen: boolean) {
    setSearch("");
    setOpen(isOpen);
  }

  const generateCommandInput =
    (group: string) =>
    (entity: {
      id: number;
      status?: string;
      dueInDays?: number;
      createDate?: string;
    }) => {
      let entityToBadge;
      let variant, status;
      switch (group) {
        case "deliveries":
          entityToBadge = entityToBadgeDelivery;
          break;
        case "invoices":
          entityToBadge = entityToBadgeInvoice;
          break;
        case "purchase-orders":
          entityToBadge = entityToBadgePurchaseOrder;
          break;
      }

      if (entityToBadge) {
        const badge = entityToBadge({
          status: entity.status,
          dueInDays: entity.dueInDays,
          createDate: entity.createDate,
        });

        variant = badge.variant;
        status = badge.status;
      }

      return (
        <CommandItem
          key={`/${group}/${entity.id}`}
          value={`/${group}/${entity.id}`}
          onSelect={(currentValue) => {
            navigate({ to: currentValue });
            setOpen(false);
          }}
        >
          {entity.id}
          {entityToBadge && <Badge variant={variant} text={status} />}
        </CommandItem>
      );
    };

  const {
    isLoading,
    customers,
    deliveries,
    invoices,
    purchaseOrders,
    collections,
  } = useGlobalSearch(search);

  if (isLoading || search === "") {
    return (
      <div className="flex flex-col gap-4">
        <CommandDialog
          open={open}
          onOpenChange={changeStateOfCommandDialog}
          className="sm:max-w-2xl"
        >
          <Command>
            <CommandInput
              value={rawSearch}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
            />
            <CommandList>
              <CommandGroup heading="Customers"></CommandGroup>
              <CommandGroup heading="Delivery Receipts"></CommandGroup>
              <CommandGroup heading="Invoices"></CommandGroup>
              <CommandGroup heading="Purchase Orders"></CommandGroup>
              <CommandGroup heading="Collections"></CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="sm:max-w-2xl"
      >
        <Command>
          <CommandInput
            value={rawSearch}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Delivery Receipts">
              {deliveries.map(generateCommandInput("deliveries"))}
            </CommandGroup>
            <CommandGroup heading="Invoices">
              {invoices.map(generateCommandInput("invoices"))}
            </CommandGroup>
            <CommandGroup heading="Purchase Orders">
              {purchaseOrders.map(generateCommandInput("purchase-orders"))}
            </CommandGroup>
            <CommandGroup heading="Collections">
              {collections.map(generateCommandInput("collections"))}
            </CommandGroup>
            <CommandGroup heading="Customers">
              {customers.map(generateCommandInput("customers"))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
