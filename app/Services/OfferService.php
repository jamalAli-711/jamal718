<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\User;
use App\Enums\UserType;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class OfferService
{
    /**
     * Map UserType enum to Offer user_type column strings.
     */
    protected function mapUserType(UserType $type): string
    {
        return match ($type) {
            UserType::Wholesaler => 'Wholesaler',
            UserType::Retailer   => 'Retailer',
            UserType::Distributor => 'Distributor',
            default            => 'End_User',
        };
    }

    /**
     * Get offers available for a specific user and their branch.
     */
    public function getEligibleOffers(User $user)
    {
        $mappedType = $this->mapUserType($user->user_type);
        $now = Carbon::now();

        return Offer::where('is_active', true)
            ->where('branch_id', $user->branch_id)
            ->where('user_type', $mappedType)
            ->where(function ($query) use ($now) {
                $query->whereNull('start_date')
                      ->orWhere('start_date', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', $now);
            })
            ->where(function ($query) {
                $query->whereNull('quantity_limit')
                      ->orWhere('quantity_limit', '>', 0);
            })
            ->get();
    }

    /**
     * Apply offers to the items in the cart.
     * 
     * @param Collection $items Items with product_id, quantity, unit_price
     * @param string|null $coupon
     * @return array Contains 'items' (with adjusted prices), 'bonuses' (extra items), and 'applied_offers'
     */
    public function applyOffers(User $user, Collection $items, ?string $coupon = null): array
    {
        $eligibleOffers = $this->getEligibleOffers($user);
        $appliedOffers = [];
        $bonuses = collect();
        $processedItems = $items->map(fn($item) => (object)$item);

        foreach ($eligibleOffers as $offer) {
            // Check coupon requirement
            if (!empty($offer->apply_coupon) && $offer->apply_coupon !== $coupon) {
                continue;
            }

            // Find target item in the cart
            $targetItem = $processedItems->firstWhere('product_id', $offer->target_product_id);
            if (!$targetItem) {
                continue;
            }

            $offerApplied = false;

            // Scenario 1: Direct Discount (Percentage / Fixed_Amount)
            if (in_array($offer->offer_type, ['Percentage', 'Fixed_Amount'])) {
                if ($targetItem->quantity >= $offer->min_purchase_qty) {
                    $discount = 0;
                    if ($offer->offer_type === 'Percentage') {
                        // discount_value expected as 0.10 for 10%
                        $discount = $targetItem->unit_price * $offer->discount_value;
                    } else {
                        // Fixed amount discount per unit
                        $discount = $offer->discount_value;
                    }

                    $targetItem->unit_price = max(0, $targetItem->unit_price - $discount);
                    $offerApplied = true;
                }
            }

            // Scenario 2: Free Units (Bonus)
            if ($offer->offer_type === 'Free_Unit') {
                if ($targetItem->quantity >= $offer->min_qty_to_achieve) {
                    $multiplier = 1;
                    if ($offer->is_cumulative) {
                        $multiplier = floor($targetItem->quantity / $offer->min_qty_to_achieve);
                    }

                    $bonuses->push([
                        'product_id' => $offer->bonus_product_id ?? $offer->target_product_id,
                        'quantity'   => $offer->bonus_qty * $multiplier,
                        'unit_id'     => $offer->bonus_unit_id,
                        'offer_id'   => $offer->id,
                        'title'      => $offer->title,
                    ]);
                    $offerApplied = true;
                }
            }

            if ($offerApplied) {
                $appliedOffers[] = [
                    'id'    => $offer->id,
                    'title' => $offer->title,
                    'type'  => $offer->offer_type,
                ];
            }
        }

        return [
            'items'          => $processedItems,
            'bonuses'        => $bonuses,
            'applied_offers' => $appliedOffers,
        ];
    }

    /**
     * Decrement the quantity limit for an offer when an order is placed.
     */
    public function decrementOfferLimits(array $offerIds)
    {
        foreach ($offerIds as $id) {
            $offer = Offer::find($id);
            if ($offer && $offer->quantity_limit !== null) {
                $offer->decrement('quantity_limit');
                if ($offer->quantity_limit <= 0) {
                    $offer->update(['is_active' => false]);
                }
            }
        }
    }
}
