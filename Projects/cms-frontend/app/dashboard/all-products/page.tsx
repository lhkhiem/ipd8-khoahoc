import { redirect } from 'next/navigation';

export default function AllProductsRedirect() {
  // Keep backward-compat route working
  redirect('/dashboard/products');
}
