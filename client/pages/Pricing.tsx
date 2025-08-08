import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Crown,
  Star,
  Target,
  BarChart3,
  Download,
  Palette,
  HeadphonesIcon,
  Zap,
  Sparkles,
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
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from "@shared/api";
import { toast } from "sonner";

export default function Pricing() {
  const { isPremium, subscriptionTier } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === "free") return;
    // Redirect to checkout page instead of processing here
    window.open(`/checkout?plan=${tier}`, '_blank');
  };

  const getPrice = (tier: SubscriptionTier) => {
    if (tier === "free") return 0;
    return SUBSCRIPTION_PLANS[tier].price; // Monthly price only
  };

  const PricingCard = ({ tier }: { tier: SubscriptionTier }) => {
    const plan = SUBSCRIPTION_PLANS[tier];
    const price = getPrice(tier);
    const isCurrentPlan = subscriptionTier === tier;
    const isPopular = tier === "premium";

    return (
      <Card 
        className={`relative transition-all duration-300 ${
          isPopular 
            ? "border-2 border-primary shadow-lg scale-105" 
            : "border border-border hover:border-primary/50"
        } ${isCurrentPlan ? "ring-2 ring-primary/20" : ""}`}
      >
        {isPopular && (
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        )}
        
        <CardHeader className="text-center pb-4">
          <div className="space-y-2">
            <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center ${
              tier === "premium" ? "bg-primary/10" : "bg-muted"
            }`}>
              {tier === "premium" ? (
                <Crown className="h-6 w-6 text-primary" />
              ) : (
                <Target className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="space-y-1">
              <div className="text-3xl font-bold">
                ${price}
                {tier !== "free" && (
                  <span className="text-lg font-normal text-muted-foreground">
                    /month
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-success flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Limitations:</div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3" />
                Daily Goals: {plan.limitations.maxDailyGoals ? `${plan.limitations.maxDailyGoals} max` : "Unlimited"}
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                Analytics: {plan.limitations.analytics ? "Full access" : "Not included"}
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-3 w-3" />
                Data Export: {plan.limitations.exportData ? "Available" : "Not available"}
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            variant={isCurrentPlan ? "outline" : tier === "premium" ? "default" : "outline"}
            onClick={() => handleUpgrade(tier)}
            disabled={loading || isCurrentPlan}
            asChild={tier === "premium" && !isCurrentPlan}
          >
            {isCurrentPlan ? (
              "Current Plan"
            ) : tier === "free" ? (
              "Downgrade to Free"
            ) : (
              <a href={`/checkout?plan=${tier}`} target="_blank" rel="noopener noreferrer">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to {plan.name}
              </a>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock your full potential with our simple monthly pricing
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard tier="free" />
          <PricingCard tier="premium" />
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Feature Comparison</CardTitle>
              <CardDescription className="text-center">
                See what you get with each plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium">Feature</div>
                <div className="font-medium text-center">Free</div>
                <div className="font-medium text-center">Premium</div>
                
                <div className="py-3 border-t">Daily Goals</div>
                <div className="py-3 border-t text-center">Up to 3</div>
                <div className="py-3 border-t text-center">Unlimited</div>
                
                <div className="py-3">Calendar View</div>
                <div className="py-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></div>
                <div className="py-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></div>
                
                <div className="py-3">Daily Reflections</div>
                <div className="py-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></div>
                <div className="py-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></div>
                
                <div className="py-3">Advanced Analytics</div>
                <div className="py-3 text-center text-muted-foreground">×</div>
                <div className="py-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></div>
                
                <div className="py-3">Data Export</div>
                <div className="py-3 text-center text-muted-foreground">×</div>
                <div className="py-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></div>
                
                <div className="py-3">Custom Categories</div>
                <div className="py-3 text-center text-muted-foreground">×</div>
                <div className="py-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></div>
                
                <div className="py-3">Priority Support</div>
                <div className="py-3 text-center text-muted-foreground">×</div>
                <div className="py-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and we'll prorate any billing adjustments.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens to my data if I downgrade?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your data is always safe! If you downgrade from Premium to Free, you'll lose access to premium features 
                  but all your existing goals and progress will remain intact.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does billing work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You'll be billed monthly for your Premium subscription. Your subscription will automatically
                  renew each month unless you choose to cancel. You can cancel anytime from your account settings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/20">
            <CardContent className="p-8">
              <div className="space-y-4">
                <Sparkles className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-2xl font-bold">Ready to transform your habits?</h3>
                <p className="text-muted-foreground">
                  Join thousands of users who have already unlocked their potential with Premium
                </p>
                <Button asChild size="lg">
                  <a href="/checkout?plan=premium" target="_blank" rel="noopener noreferrer">
                    <Crown className="h-5 w-5 mr-2" />
                    Start Your Premium Journey
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
