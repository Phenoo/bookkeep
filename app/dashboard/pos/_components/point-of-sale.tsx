"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Trash2, User, Search } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Spinner } from "@/components/spinner";
import type { Id } from "@/convex/_generated/dataModel";
import { formatNaira } from "@/lib/utils";

// Types
interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  price: number;
  category: string;
  image?: string;
}

interface CartItem {
  _id: Id<"menuItems">;
  menuItemId: Id<"menuItems">;
  name: string;
  price: number;
  category: string;
  quantity: number;
  subtotal: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export function PosSystem() {
  const { user } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const menuItems = useQuery(api.menu.getAllMenuItems);
  const addOrders = useMutation(api.orders.add);

  const itemsPerPage = 5;

  // Filter menu items based on search query and current tab
  const filterMenuItems = (category: "food" | "drink") => {
    if (!menuItems) return [];

    return menuItems
      .filter(
        (item) =>
          item.category === category &&
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  };

  const totalPages = (category: "food" | "drink") => {
    if (!menuItems) return 1;

    const filteredItems = menuItems.filter(
      (item) =>
        item.category === category &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return Math.ceil(filteredItems.length / itemsPerPage);
  };

  // Add item to cart - FIXED
  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      // Find if item already exists in cart
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItemIndex >= 0) {
        // Item already in cart, create a new array with updated item
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];

        // Update quantity and recalculate subtotal
        const newQuantity = existingItem.quantity + 1;
        const newSubtotal = newQuantity * item.price;

        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: newSubtotal,
        };

        return updatedCart;
      } else {
        // Add new item to cart
        return [
          ...prevCart,
          {
            _id: item._id,
            menuItemId: item._id,
            name: item.name,
            price: item.price,
            category: item.category,
            quantity: 1,
            subtotal: item.price,
          },
        ];
      }
    });

    toast("Item added", {
      description: `${item.name} added to cart`,
    });
  };

  // Remove item from cart - FIXED
  const removeFromCart = (itemId: Id<"menuItems">) => {
    setCart((prevCart) => {
      // Find the item in the cart
      const existingItemIndex = prevCart.findIndex(
        (item) => item._id === itemId
      );

      if (existingItemIndex === -1) return prevCart; // Item not found

      const existingItem = prevCart[existingItemIndex];

      if (existingItem.quantity > 1) {
        // Decrease quantity if more than 1
        const updatedCart = [...prevCart];
        const newQuantity = existingItem.quantity - 1;
        const newSubtotal = newQuantity * existingItem.price;

        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: newSubtotal,
        };

        return updatedCart;
      } else {
        // Remove item from cart if quantity is 1
        return prevCart.filter((item) => item._id !== itemId);
      }
    });
  };

  // Delete item from cart
  const deleteFromCart = (itemId: Id<"menuItems">) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));

    toast("Item removed", {
      description: "Item removed from cart",
    });
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  // Handle customer details submission
  const handleCustomerDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerDialogOpen(false);

    toast("Customer details saved", {
      description: `Details saved for ${customerDetails.name}`,
    });
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast("Cart is empty", {
        description: "Please add items to the cart before checkout",
      });
      return;
    }

    // Prepare cart items for the order
    const orderItems = cart.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      category: item.category,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const promise = addOrders({
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      items: orderItems,
      totalAmount: calculateTotal(),
      notes: additionalInfo,
      status: "pending",
    });

    toast.promise(promise, {
      loading: "Order in progress",
      success: "Order completed",
      error: "Error taking order",
    });

    // Clear cart and customer details
    setCart([]);
    setCustomerDetails({
      name: "",
      phone: "",
      email: "",
      notes: "",
    });
    setAdditionalInfo("");
  };

  if (menuItems === undefined) {
    return (
      <div className="h-full w-full">
        <Spinner />
      </div>
    );
  }

  if (menuItems === null) {
    return (
      <div className="h-full w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Menu Section */}
      <div className="">
        <Card>
          <CardHeader>
            <CardTitle>Menus</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="food" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="food">Food</TabsTrigger>
                <TabsTrigger value="drink">Drinks</TabsTrigger>
              </TabsList>

              <TabsContent value="food" className="space-y-4">
                {filterMenuItems("food").map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.image || "/placeholder.svg?height=40&width=40"
                        }
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{formatNaira(item.price)}</span>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages("food")}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages("food"))
                      )
                    }
                    disabled={currentPage === totalPages("food")}
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="drink" className="space-y-4">
                {filterMenuItems("drink").map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.image || "/placeholder.svg?height=40&width=40"
                        }
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{formatNaira(item.price)}</span>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages("drink")}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages("drink"))
                      )
                    }
                    disabled={currentPage === totalPages("drink")}
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            {cart.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{formatNaira(item.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(item._id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{formatNaira(item.subtotal)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => deleteFromCart(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Cart is empty
              </div>
            )}

            <div className="mt-4 text-right font-bold">
              Total: {formatNaira(calculateTotal())}
            </div>
          </CardContent>

          <div className="px-6 pb-6 space-y-4">
            {/* Customer Details Button */}
            <Dialog
              open={customerDialogOpen}
              onOpenChange={setCustomerDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Customer Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Customer Details</DialogTitle>
                  <DialogDescription>
                    Add customer information for this order
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCustomerDetailsSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={customerDetails.name}
                        onChange={(e) =>
                          setCustomerDetails({
                            ...customerDetails,
                            name: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={customerDetails.phone}
                        onChange={(e) =>
                          setCustomerDetails({
                            ...customerDetails,
                            phone: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerDetails.email}
                        onChange={(e) =>
                          setCustomerDetails({
                            ...customerDetails,
                            email: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={customerDetails.notes}
                        onChange={(e) =>
                          setCustomerDetails({
                            ...customerDetails,
                            notes: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save details</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Additional Info */}
            <div>
              <Label htmlFor="additionalInfo">Additional Info</Label>
              <Textarea
                id="additionalInfo"
                placeholder="e.g., allergies or any other information"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Checkout Button */}
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Checkout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// "use client";

// import type React from "react";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
// import { Plus, Minus, Trash2, User, Search } from "lucide-react";
// import { toast } from "sonner";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useUser } from "@clerk/clerk-react";
// import { Spinner } from "@/components/spinner";
// import { Id } from "@/convex/_generated/dataModel";
// import { formatNaira } from "@/lib/utils";

// // Types
// interface MenuItem {
//   _id: Id<"menuItems">;
//   name: string;
//   price: number;
//   category: string;
//   image?: string;
// }

// interface CartItem extends MenuItem {
//   quantity: number;
//   subtotal: number;
// }

// interface CustomerDetails {
//   name: string;
//   phone: string;
//   email: string;
//   notes: string;
// }

// // Sample menu data

// export function PosSystem() {
//   const { user } = useUser();
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
//     name: "",
//     phone: "",
//     email: "",
//     notes: "",
//   });
//   const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
//   const [additionalInfo, setAdditionalInfo] = useState("");

//   const menuItems = useQuery(api.menu.getAllMenuItems);
//   const addOrders = useMutation(api.orders.add);

//   const itemsPerPage = 5;

//   // Filter menu items based on search query and current tab
//   const filterMenuItems = (category: "food" | "drink") => {
//     return menuItems
//       .filter(
//         (item) =>
//           item.category === category &&
//           item.name.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//       .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//   };

//   const totalPages = (category: "food" | "drink") => {
//     const filteredItems = menuItems.filter(
//       (item) =>
//         item.category === category &&
//         item.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//     return Math.ceil(filteredItems.length / itemsPerPage);
//   };

//   // Add item to cart
//   const addToCart = (item: MenuItem) => {
//     setCart((prevCart) => {
//       const existingItem = prevCart.find(
//         (cartItem) => cartItem._id === item._id
//       );

//       if (existingItem) {
//         // Item already in cart, increase quantity
//         return prevCart.map((cartItem) =>
//           cartItem._id === item._id
//             ? {
//                 ...cartItem,

//                 quantity: cartItem.quantity + 1,
//                 subtotal: (cartItem.quantity + 1) * cartItem.price,
//               }
//             : cartItem
//         );
//       } else {
//         // Add new item to cart
//         return [
//           ...prevCart,
//           {
//             menuItemId: item._id,
//             name: item.name,
//             price: item.price,
//             category: item.category,
//             quantity: 1,
//             subtotal: item.price,
//           },
//         ];
//       }
//     });

//     toast("Item added", {
//       description: `${item.name} added to cart`,
//     });
//   };

//   // Remove item from cart
//   const removeFromCart = (itemId: string) => {
//     setCart((prevCart) => {
//       const existingItem = prevCart.find((item) => item._id === itemId);

//       if (existingItem && existingItem.quantity > 1) {
//         // Decrease quantity if more than 1
//         return prevCart.map((item) =>
//           item._id === itemId
//             ? {
//                 ...item,
//                 quantity: item.quantity - 1,
//                 subtotal: (item.quantity - 1) * item.price,
//               }
//             : item
//         );
//       } else {
//         // Remove item from cart if quantity is 1
//         return prevCart.filter((item) => item._id !== itemId);
//       }
//     });
//   };

//   // Delete item from cart
//   const deleteFromCart = (itemId: string) => {
//     setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));

//     toast("Item removed", {
//       description: "Item removed from cart",
//     });
//   };

//   // Calculate total
//   const calculateTotal = () => {
//     return cart.reduce((total, item) => total + item.subtotal, 0);
//   };

//   // Handle customer details submission
//   const handleCustomerDetailsSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setCustomerDialogOpen(false);

//     toast("Customer details saved", {
//       description: `Details saved for ${customerDetails.name}`,
//     });
//   };

//   // Handle checkout
//   const handleCheckout = () => {
//     if (cart.length === 0) {
//       toast("Cart is empty", {
//         description: "Please add items to the cart before checkout",
//       });
//       return;
//     }

//     const promise = addOrders({
//       customerName: customerDetails.name,
//       customerEmail: customerDetails.email,
//       customerPhone: customerDetails.phone,
//       items: cart,
//       totalAmount: calculateTotal(),
//       notes: additionalInfo,
//       status: "",
//     });
//     // In a real app, you would save the order to the database here
//     // For now, we'll just show a success message and clear the cart

//     toast.promise(promise, {
//       loading: "Order in progress",
//       success: "Order completed",
//       error: "Error taking order",
//     });

//     // Clear cart and customer details
//     setCart([]);
//     setCustomerDetails({
//       name: "",
//       phone: "",
//       email: "",
//       notes: "",
//     });
//     setAdditionalInfo("");
//   };

//   // Format price to display in pounds

//   if (menuItems === undefined) {
//     return (
//       <div className="h-full w-full">
//         <Spinner />
//       </div>
//     );
//   }

//   if (menuItems === null) {
//     return (
//       <div className="h-full w-full">
//         <Spinner />
//       </div>
//     );
//   }
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
//       {/* Menu Section */}
//       <div className="">
//         <Card>
//           <CardHeader>
//             <CardTitle>Menus</CardTitle>
//             <div className="flex items-center gap-2">
//               <Search className="w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   setCurrentPage(1); // Reset to first page on search
//                 }}
//                 className="max-w-sm"
//               />
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="food" className="w-full">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="food">Food</TabsTrigger>
//                 <TabsTrigger value="drink">Drinks</TabsTrigger>
//               </TabsList>

//               <TabsContent value="food" className="space-y-4">
//                 {filterMenuItems("food").map((item) => (
//                   <div
//                     key={item._id}
//                     className="flex items-center justify-between p-2 border-b"
//                   >
//                     <div className="flex items-center gap-3">
//                       <img
//                         src={item.image || "/placeholder.svg"}
//                         alt={item.name}
//                         className="w-10 h-10 rounded-full object-cover"
//                       />
//                       <span>{item.name}</span>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <span>{formatNaira(item.price)}</span>
//                       <Button
//                         variant="default"
//                         size="icon"
//                         onClick={() => addToCart(item)}
//                       >
//                         <Plus className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Pagination */}
//                 <div className="flex justify-between items-center mt-4">
//                   <Button
//                     variant="outline"
//                     onClick={() =>
//                       setCurrentPage((prev) => Math.max(prev - 1, 1))
//                     }
//                     disabled={currentPage === 1}
//                   >
//                     Previous
//                   </Button>
//                   <span className="text-sm">
//                     Page {currentPage} of {totalPages("food")}
//                   </span>
//                   <Button
//                     variant="outline"
//                     onClick={() =>
//                       setCurrentPage((prev) =>
//                         Math.min(prev + 1, totalPages("food"))
//                       )
//                     }
//                     disabled={currentPage === totalPages("food")}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </TabsContent>

//               <TabsContent value="drink" className="space-y-4">
//                 {filterMenuItems("drink").map((item) => (
//                   <div
//                     key={item._id}
//                     className="flex items-center justify-between p-2 border-b"
//                   >
//                     <div className="flex items-center gap-3">
//                       <img
//                         src={item.image || "/placeholder.svg"}
//                         alt={item.name}
//                         className="w-10 h-10 rounded-full object-cover"
//                       />
//                       <span>{item.name}</span>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <span>{formatNaira(item.price)}</span>
//                       <Button
//                         variant="default"
//                         size="icon"
//                         onClick={() => addToCart(item)}
//                       >
//                         <Plus className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Pagination */}
//                 <div className="flex justify-between items-center mt-4">
//                   <Button
//                     variant="outline"
//                     onClick={() =>
//                       setCurrentPage((prev) => Math.max(prev - 1, 1))
//                     }
//                     disabled={currentPage === 1}
//                   >
//                     Previous
//                   </Button>
//                   <span className="text-sm">
//                     Page {currentPage} of {totalPages("drink")}
//                   </span>
//                   <Button
//                     variant="outline"
//                     onClick={() =>
//                       setCurrentPage((prev) =>
//                         Math.min(prev + 1, totalPages("drink"))
//                       )
//                     }
//                     disabled={currentPage === totalPages("drink")}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Cart Section */}
//       <div className="">
//         <Card className="h-full flex flex-col">
//           <CardHeader>
//             <CardTitle>Cart</CardTitle>
//           </CardHeader>
//           <CardContent className="flex-grow overflow-auto">
//             {cart.length > 0 ? (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Item</TableHead>
//                     <TableHead>Price</TableHead>
//                     <TableHead>Quantity</TableHead>
//                     <TableHead>Subtotal</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {cart.map((item) => (
//                     <TableRow key={item._id}>
//                       <TableCell className="font-medium">{item.name}</TableCell>
//                       <TableCell>{formatNaira(item.price)}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-6 w-6"
//                             onClick={() => removeFromCart(item._id)}
//                           >
//                             <Minus className="h-3 w-3" />
//                           </Button>
//                           <span>{item.quantity}</span>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-6 w-6"
//                             onClick={() => addToCart(item)}
//                           >
//                             <Plus className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                       <TableCell>{formatNaira(item.subtotal)}</TableCell>
//                       <TableCell>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-7 w-7 text-red-500"
//                           onClick={() => deleteFromCart(item._id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             ) : (
//               <div className="text-center py-8 text-muted-foreground">
//                 Cart is empty
//               </div>
//             )}

//             <div className="mt-4 text-right font-bold">
//               Total: {formatNaira(calculateTotal())}
//             </div>
//           </CardContent>

//           <div className="px-6 pb-6 space-y-4">
//             {/* Customer Details Button */}
//             <Dialog
//               open={customerDialogOpen}
//               onOpenChange={setCustomerDialogOpen}
//             >
//               <DialogTrigger asChild>
//                 <Button variant="outline" className="w-full">
//                   <User className="mr-2 h-4 w-4" />
//                   Customer Details
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Customer Details</DialogTitle>
//                   <DialogDescription>
//                     Add customer information for this order
//                   </DialogDescription>
//                 </DialogHeader>
//                 <form onSubmit={handleCustomerDetailsSubmit}>
//                   <div className="grid gap-4 py-4">
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label htmlFor="name" className="text-right">
//                         Name
//                       </Label>
//                       <Input
//                         id="name"
//                         value={customerDetails.name}
//                         onChange={(e) =>
//                           setCustomerDetails({
//                             ...customerDetails,
//                             name: e.target.value,
//                           })
//                         }
//                         className="col-span-3"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label htmlFor="phone" className="text-right">
//                         Phone
//                       </Label>
//                       <Input
//                         id="phone"
//                         value={customerDetails.phone}
//                         onChange={(e) =>
//                           setCustomerDetails({
//                             ...customerDetails,
//                             phone: e.target.value,
//                           })
//                         }
//                         className="col-span-3"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label htmlFor="email" className="text-right">
//                         Email
//                       </Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={customerDetails.email}
//                         onChange={(e) =>
//                           setCustomerDetails({
//                             ...customerDetails,
//                             email: e.target.value,
//                           })
//                         }
//                         className="col-span-3"
//                       />
//                     </div>
//                     <div className="grid grid-cols-4 items-center gap-4">
//                       <Label htmlFor="notes" className="text-right">
//                         Notes
//                       </Label>
//                       <Textarea
//                         id="notes"
//                         value={customerDetails.notes}
//                         onChange={(e) =>
//                           setCustomerDetails({
//                             ...customerDetails,
//                             notes: e.target.value,
//                           })
//                         }
//                         className="col-span-3"
//                       />
//                     </div>
//                   </div>
//                   <DialogFooter>
//                     <Button type="submit">Save details</Button>
//                   </DialogFooter>
//                 </form>
//               </DialogContent>
//             </Dialog>

//             {/* Additional Info */}
//             <div>
//               <Label htmlFor="additionalInfo">Additional Info</Label>
//               <Textarea
//                 id="additionalInfo"
//                 placeholder="e.g., allergies or any other information"
//                 value={additionalInfo}
//                 onChange={(e) => setAdditionalInfo(e.target.value)}
//                 className="mt-1"
//               />
//             </div>

//             {/* Checkout Button */}
//             <Button className="w-full" size="lg" onClick={handleCheckout}>
//               Checkout
//             </Button>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
