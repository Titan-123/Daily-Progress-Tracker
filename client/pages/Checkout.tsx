import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Check,
  CreditCard,
  Lock,
  Shield,
  Loader2,
  CheckCircle2,
  Target,
  BarChart3,
  Download,
  Palette,
  HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from "@shared/api";
import { toast } from "sonner";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const planParam = searchParams.get("plan") as SubscriptionTier;
  const selectedPlan =
    planParam && SUBSCRIPTION_PLANS[planParam] ? planParam : "premium";
  const plan = SUBSCRIPTION_PLANS[selectedPlan];

  // Mock payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: user?.email || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please log in to continue");
      return;
    }

    // Basic validation
    if (
      !paymentForm.cardNumber ||
      !paymentForm.expiryDate ||
      !paymentForm.cvv ||
      !paymentForm.cardholderName
    ) {
      toast.error("Please fill in all payment details");
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call backend to update subscription
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          planTier: selectedPlan,
          paymentDetails: {
            last4: paymentForm.cardNumber.slice(-4),
            cardholderName: paymentForm.cardholderName,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process upgrade");
      }

      const result = await response.json();

      // Update user data in auth context
      if (refreshUser) {
        await refreshUser();
      }

      // Also update localStorage directly to ensure persistence
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (currentUser) {
        currentUser.subscription = {
          tier: "premium",
          status: "active",
          startDate: new Date().toISOString(),
        };
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      // Notify parent window if this is opened in a new tab
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "SUBSCRIPTION_UPGRADED",
            tier: "premium",
          },
          window.location.origin,
        );
      }

      setPurchaseComplete(true);
      toast.success("🎉 Welcome to Premium! Your subscription is now active.");
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <div className="p-4 rounded-full bg-success/10 w-fit mx-auto">
                <CheckCircle2 className="h-16 w-16 text-success" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-4">
                  Welcome to Premium! 🎉
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your subscription has been activated successfully. You now
                  have access to all Premium features!
                </p>
              </div>
            </div>

            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/10">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-4">
                  What's now available:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-success" />
                    <span>Unlimited daily goals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-success" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-success" />
                    <span>Data export</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-success" />
                    <span>Custom categories</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HeadphonesIcon className="h-5 w-5 text-success" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-success" />
                    <span>Premium badge</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    // Notify parent and close window
                    if (window.opener) {
                      window.opener.postMessage(
                        {
                          type: "SUBSCRIPTION_UPGRADED",
                          tier: "premium",
                        },
                        window.location.origin,
                      );
                      window.close();
                    } else {
                      navigate("/");
                    }
                  }}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  Return to Dashboard
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open("/", "_blank")}
                >
                  Open New Tab
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your Premium features are now active! Return to the dashboard to
                start using them.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => window.close()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your Premium upgrade
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Monthly subscription
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${plan.price}/month</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>${plan.price}/month</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">What's included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Secure Payment</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your payment information is encrypted and secure. This is a
                  demo checkout process.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Enter your payment information (Demo - use any values)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={paymentForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={paymentForm.cardholderName}
                    onChange={(e) =>
                      handleInputChange("cardholderName", e.target.value)
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) =>
                      handleInputChange("cardNumber", e.target.value)
                    }
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={paymentForm.expiryDate}
                      onChange={(e) =>
                        handleInputChange("expiryDate", e.target.value)
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentForm.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Complete Purchase - ${plan.price}/month
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase, you agree to our Terms of Service.
                Your subscription will auto-renew monthly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
