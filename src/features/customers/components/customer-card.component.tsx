import { Card, CardContent } from "@/components/ui/card";
import { Key } from "@/components/ui/key-pair/key";
import { Value } from "@/components/ui/key-pair/value";

interface CustomerCardOptions {
  customer: {
    name: string;
    address: string;
    tin: string;
    phoneNumber: string;
    email: string;
  };
  className?: string;
}

export function CustomerCard({
  customer,
  className = "",
}: CustomerCardOptions) {
  return (
    <Card
      className={`rounded-lg border-0.5px border-#989898 gap-4 ${className}`}
    >
      <CardContent>
        <p className="mb-4 text-xs font-normal text-gray-500">
          Customer Details
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Key className="mb-2">Customer</Key>
            <Value>{customer.name}</Value>
          </div>
          <div>
            <Key className="mb-2">Address</Key>
            <Value>{customer.address}</Value>
          </div>
          <div>
            <Key className="mb-2">TIN</Key>
            <Value>{customer.tin}</Value>
          </div>
          <div>
            <Key className="mb-2">Contact</Key>
            <Value>
              {customer.phoneNumber}
              <br />
              {customer.email}
            </Value>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
