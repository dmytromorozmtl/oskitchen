import { NextResponse } from "next/server";

const templates: Record<string, string> = {
  products:
    "title,sku,price,prepared_date,pickup_date,description,allergens\nChicken Bowl Large,CHK-BOWL-L,14.00,2026-06-01,2026-06-03,High protein bowl,contains sesame\n",
  customers:
    "email,name,phone,notes\njane@example.com,Jane Customer,+15555550100,VIP weekly pickup\n",
  orders:
    "order_number,customer_email,customer_name,total,fulfillment_type,fulfillment_date,external_items\n1005,jane@example.com,Jane Customer,42.00,PICKUP,2026-06-03,\"Chicken Bowl Large x2\"\n",
  ingredients:
    "name,unit,cost_per_unit,current_stock,par_level,supplier\nChicken breast,lb,3.75,25,40,Sysco\n",
  recipes:
    "recipe_name,product_title,yield_quantity,yield_unit,ingredient_name,quantity,unit\nChicken Bowl Large,Chicken Bowl Large,1,portion,Chicken breast,0.5,lb\n",
  staff:
    "name,email,role\nAlex Packer,alex@example.com,packing\n",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const csv = templates[type];
  if (!csv) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${type}.csv"`,
    },
  });
}
