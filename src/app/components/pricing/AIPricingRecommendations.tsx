import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Slider } from '@/app/components/ui/slider';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Target,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingInput {
  service_type: string;
  base_price: number;
  currency: string;
  location: string;
  season: string;
  capacity: number;
  competitors_count: number;
  rating: number;
  amenities_count: number;
}

interface PricingRecommendation {
  recommended_price: number;
  min_price: number;
  max_price: number;
  confidence: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
  dynamic_pricing: {
    weekday: number;
    weekend: number;
    peak_season: number;
    off_season: number;
  };
  occupancy_optimization: {
    high_demand: number;
    medium_demand: number;
    low_demand: number;
  };
  competitor_analysis: {
    your_price: number;
    avg_competitor: number;
    positioning: string;
  };
}

export function AIPricingRecommendations() {
  const [input, setInput] = useState<PricingInput>({
    service_type: 'accommodation',
    base_price: 100,
    currency: 'USD',
    location: 'TZ',
    season: 'peak',
    capacity: 4,
    competitors_count: 5,
    rating: 4.2,
    amenities_count: 8,
  });

  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRecommendation = () => {
    setLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      // Mock AI pricing algorithm
      let baseMultiplier = 1.0;

      // Season impact
      if (input.season === 'peak') baseMultiplier *= 1.4;
      else if (input.season === 'shoulder') baseMultiplier *= 1.1;
      else baseMultiplier *= 0.85;

      // Location impact
      const locationMultipliers: Record<string, number> = {
        TZ: 1.2, // Tanzania (Serengeti premium)
        KE: 1.15, // Kenya (Masai Mara)
        UG: 0.95, // Uganda
        RW: 1.0, // Rwanda
        BI: 0.85, // Burundi
      };
      baseMultiplier *= locationMultipliers[input.location] || 1.0;

      // Rating impact
      const ratingBonus = (input.rating - 3) * 0.15;
      baseMultiplier *= 1 + ratingBonus;

      // Capacity optimization
      if (input.capacity > 6) baseMultiplier *= 1.1;

      // Competition
      if (input.competitors_count > 8) baseMultiplier *= 0.95;
      else if (input.competitors_count < 3) baseMultiplier *= 1.1;

      // Amenities
      if (input.amenities_count > 10) baseMultiplier *= 1.15;

      const recommendedPrice = Math.round(input.base_price * baseMultiplier);
      const minPrice = Math.round(recommendedPrice * 0.75);
      const maxPrice = Math.round(recommendedPrice * 1.35);

      const avgCompetitor = input.base_price * 1.05;
      let positioning = 'competitive';
      if (recommendedPrice > avgCompetitor * 1.15) positioning = 'premium';
      else if (recommendedPrice < avgCompetitor * 0.9) positioning = 'budget';

      const result: PricingRecommendation = {
        recommended_price: recommendedPrice,
        min_price: minPrice,
        max_price: maxPrice,
        confidence: 87 + Math.floor(Math.random() * 10),
        factors: [
          {
            name: 'Seasonal Demand',
            impact: input.season === 'peak' ? 40 : input.season === 'shoulder' ? 10 : -15,
            description:
              input.season === 'peak'
                ? 'High tourism season - premium pricing opportunity'
                : input.season === 'shoulder'
                ? 'Moderate demand - balanced pricing'
                : 'Low season - competitive pricing needed',
          },
          {
            name: 'Location Premium',
            impact: Math.round((locationMultipliers[input.location] - 1) * 100),
            description: `${input.location} location impact on pricing`,
          },
          {
            name: 'Guest Rating',
            impact: Math.round(ratingBonus * 100),
            description: `${input.rating}/5.0 rating allows for ${ratingBonus > 0 ? 'higher' : 'lower'} pricing`,
          },
          {
            name: 'Competition Level',
            impact: input.competitors_count > 8 ? -5 : input.competitors_count < 3 ? 10 : 0,
            description: `${input.competitors_count} competitors in area`,
          },
          {
            name: 'Amenities & Features',
            impact: input.amenities_count > 10 ? 15 : input.amenities_count > 5 ? 5 : -5,
            description: `${input.amenities_count} amenities - ${input.amenities_count > 10 ? 'Premium' : 'Standard'} offering`,
          },
        ],
        dynamic_pricing: {
          weekday: recommendedPrice,
          weekend: Math.round(recommendedPrice * 1.15),
          peak_season: Math.round(recommendedPrice * 1.3),
          off_season: Math.round(recommendedPrice * 0.7),
        },
        occupancy_optimization: {
          high_demand: Math.round(recommendedPrice * 1.2),
          medium_demand: recommendedPrice,
          low_demand: Math.round(recommendedPrice * 0.8),
        },
        competitor_analysis: {
          your_price: recommendedPrice,
          avg_competitor: Math.round(avgCompetitor),
          positioning,
        },
      };

      setRecommendation(result);
      setLoading(false);
      toast.success('AI pricing recommendation generated!');
    }, 1500);
  };

  const updateInput = (field: string, value: any) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          AI Pricing Recommendations
        </h1>
        <p className="text-gray-600">
          Get intelligent pricing suggestions based on market data, seasonality, and competition
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Service Details</h2>

          <div className="space-y-4">
            <div>
              <Label>Service Type</Label>
              <Select value={input.service_type} onValueChange={(v) => updateInput('service_type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="tour">Tour Package</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
                  <SelectItem value="guide">Guide Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Price</Label>
                <Input
                  type="number"
                  value={input.base_price}
                  onChange={(e) => updateInput('base_price', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={input.currency} onValueChange={(v) => updateInput('currency', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">🇺🇸 USD</SelectItem>
                    <SelectItem value="KES">🇰🇪 KES</SelectItem>
                    <SelectItem value="UGX">🇺🇬 UGX</SelectItem>
                    <SelectItem value="TZS">🇹🇿 TZS</SelectItem>
                    <SelectItem value="RWF">🇷🇼 RWF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <Select value={input.location} onValueChange={(v) => updateInput('location', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TZ">🇹🇿 Tanzania</SelectItem>
                  <SelectItem value="KE">🇰🇪 Kenya</SelectItem>
                  <SelectItem value="UG">🇺🇬 Uganda</SelectItem>
                  <SelectItem value="RW">🇷🇼 Rwanda</SelectItem>
                  <SelectItem value="BI">🇧🇮 Burundi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Season</Label>
              <Select value={input.season} onValueChange={(v) => updateInput('season', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peak">Peak Season (High Demand)</SelectItem>
                  <SelectItem value="shoulder">Shoulder Season (Medium)</SelectItem>
                  <SelectItem value="off">Off Season (Low Demand)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Capacity: {input.capacity} guests</Label>
              <Slider
                value={[input.capacity]}
                onValueChange={([v]) => updateInput('capacity', v)}
                min={1}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Rating: {input.rating}/5.0</Label>
              <Slider
                value={[input.rating * 10]}
                onValueChange={([v]) => updateInput('rating', v / 10)}
                min={10}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Competitors in Area: {input.competitors_count}</Label>
              <Slider
                value={[input.competitors_count]}
                onValueChange={([v]) => updateInput('competitors_count', v)}
                min={0}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Number of Amenities: {input.amenities_count}</Label>
              <Slider
                value={[input.amenities_count]}
                onValueChange={([v]) => updateInput('amenities_count', v)}
                min={0}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>

            <Button onClick={generateRecommendation} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Market Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Recommendation
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Recommendation Output */}
        <div className="space-y-4">
          {!recommendation && !loading && (
            <Card className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-gray-500">
                Fill in your service details and click "Generate AI Recommendation"
              </p>
            </Card>
          )}

          {loading && (
            <Card className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600">Analyzing market conditions...</p>
            </Card>
          )}

          {recommendation && (
            <>
              {/* Recommended Price */}
              <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">AI Recommended Price</h3>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {recommendation.confidence}% Confidence
                  </Badge>
                </div>
                <div className="text-5xl font-bold mb-3">
                  {input.currency} {recommendation.recommended_price.toLocaleString()}
                </div>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <div>
                    Min: {input.currency} {recommendation.min_price.toLocaleString()}
                  </div>
                  <div>•</div>
                  <div>
                    Max: {input.currency} {recommendation.max_price.toLocaleString()}
                  </div>
                </div>
              </Card>

              {/* Pricing Factors */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Pricing Factors</h3>
                <div className="space-y-3">
                  {recommendation.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          factor.impact > 0
                            ? 'bg-green-100'
                            : factor.impact < 0
                            ? 'bg-red-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        {factor.impact > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : factor.impact < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <Target className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{factor.name}</span>
                          <span
                            className={`text-sm font-semibold ${
                              factor.impact > 0
                                ? 'text-green-600'
                                : factor.impact < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {factor.impact > 0 ? '+' : ''}
                            {factor.impact}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Dynamic Pricing */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Dynamic Pricing Strategy</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Weekday</div>
                    <div className="text-lg font-bold text-blue-600">
                      {input.currency} {recommendation.dynamic_pricing.weekday}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Weekend</div>
                    <div className="text-lg font-bold text-green-600">
                      {input.currency} {recommendation.dynamic_pricing.weekend}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Peak Season</div>
                    <div className="text-lg font-bold text-orange-600">
                      {input.currency} {recommendation.dynamic_pricing.peak_season}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Off Season</div>
                    <div className="text-lg font-bold text-gray-600">
                      {input.currency} {recommendation.dynamic_pricing.off_season}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Competitor Analysis */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Market Positioning</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Your Recommended Price:</span>
                    <span className="font-bold">
                      {input.currency} {recommendation.competitor_analysis.your_price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Competitor:</span>
                    <span className="font-semibold text-gray-700">
                      {input.currency} {recommendation.competitor_analysis.avg_competitor}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <Badge
                      className={
                        recommendation.competitor_analysis.positioning === 'premium'
                          ? 'bg-purple-100 text-purple-800'
                          : recommendation.competitor_analysis.positioning === 'budget'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {recommendation.competitor_analysis.positioning.toUpperCase()} Positioning
                    </Badge>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
