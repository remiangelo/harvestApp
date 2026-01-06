# In-App Subscriptions Setup Guide

Complete guide to setting up Apple and Google in-app subscriptions for Harvest.

---

## 📱 Apple In-App Purchases (iOS)

### 1. App Store Connect Setup

#### A. Create Subscription Group

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **My Apps** → **Harvest** → **Subscriptions**
3. Click **Create Subscription Group**
   - **Reference Name**: `Harvest Premium Subscriptions`
   - **App Name**: Display name users see (e.g., "Premium Features")

#### B. Create Subscription Products

Create **2 subscription products** (Green and Gold):

**Green Subscription:**

- **Product ID**: `com.harvest.harvestdating.green.monthly`
- **Reference Name**: `Green Monthly Subscription`
- **Subscription Duration**: 1 Month (auto-renewable)
- **Price**: $9.99 USD (Tier 10)
- **Localization**:
  - **Name**: `🟢 Green`
  - **Description**: `Unlimited matches, values-based matching, 1 daily Gardener conversation (10,000 characters), advanced filters.`
- **Review Information**: Screenshot showing Green features
- **Promotional Images**: Optional (for Today tab)

**Gold Subscription:**

- **Product ID**: `com.harvest.harvestdating.gold.monthly`
- **Reference Name**: `Gold Monthly Subscription`
- **Subscription Duration**: 1 Month (auto-renewable)
- **Price**: $19.99 USD (Tier 20)
- **Localization**:
  - **Name**: `✨ Gold`
  - **Description**: `Unlimited everything, see who likes you, full filters suite, unlimited Gardener (30,000 chars/day).`

#### C. Optional: Add Yearly Plans

For better revenue (users prepay):

- `com.harvest.harvestdating.green.yearly` - $79.99/year (save 33%)
- `com.harvest.harvestdating.gold.yearly` - $159.99/year (save 33%)

#### D. Set Up Introductory Offers (Recommended)

- **Free Trial**: 7 days free, then $9.99/month
- **Pay Up Front**: $4.99 for first month, then $9.99
- **Pay As You Go**: $4.99/month for 3 months, then $9.99

---

### 2. Install react-native-iap Library

```bash
npm install react-native-iap
npx expo prebuild
```

**Update app.json/app.config.js:**

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-iap",
        {
          "enablePendingPurchases": true
        }
      ]
    ]
  }
}
```

---

### 3. Create iOS Subscription Service

**File**: `lib/iap/appleIAP.ts`

```typescript
import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

const PRODUCT_IDS = {
  GREEN_MONTHLY: 'com.harvest.harvestdating.green.monthly',
  GREEN_YEARLY: 'com.harvest.harvestdating.green.yearly',
  GOLD_MONTHLY: 'com.harvest.harvestdating.gold.monthly',
  GOLD_YEARLY: 'com.harvest.harvestdating.gold.yearly',
};

export const appleIAP = {
  async initialize() {
    try {
      await RNIap.initConnection();

      if (Platform.OS === 'ios') {
        await RNIap.clearTransactionIOS();
      }

      console.log('IAP initialized');
    } catch (error) {
      console.error('IAP init error:', error);
    }
  },

  async getProducts() {
    try {
      const products = await RNIap.getSubscriptions({
        skus: Object.values(PRODUCT_IDS),
      });
      return products;
    } catch (error) {
      console.error('Get products error:', error);
      return [];
    }
  },

  async purchaseSubscription(productId: string) {
    try {
      await RNIap.requestSubscription({
        sku: productId,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      throw error;
    }
  },

  async restorePurchases() {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      return purchases;
    } catch (error) {
      console.error('Restore error:', error);
      return [];
    }
  },

  async validateReceipt(receiptData: string, userId: string) {
    // Send to your backend for server-side validation
    const response = await fetch('https://your-api.com/validate-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt: receiptData,
        userId,
        platform: 'ios',
      }),
    });

    return await response.json();
  },

  setupPurchaseListener(callback: (purchase: any) => void) {
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          // Validate with backend
          callback(purchase);

          // Acknowledge purchase
          if (Platform.OS === 'ios') {
            await RNIap.finishTransactionIOS({
              purchase: purchase as any,
            });
          }
        } catch (error) {
          console.error('Purchase validation error:', error);
        }
      }
    });

    const purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.error('Purchase error listener:', error);
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  },
};
```

---

### 4. Backend Receipt Validation (CRITICAL)

**Never trust client-side validation!** Always validate on your server.

**Create Supabase Edge Function:**

```bash
supabase functions new validate-apple-receipt
```

**File**: `supabase/functions/validate-apple-receipt/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const APPLE_VERIFY_URL = {
  production: 'https://buy.itunes.apple.com/verifyReceipt',
  sandbox: 'https://sandbox.itunes.apple.com/verifyReceipt',
};

serve(async (req) => {
  const { receipt, userId } = await req.json();

  // Try production first, fallback to sandbox
  let response = await fetch(APPLE_VERIFY_URL.production, {
    method: 'POST',
    body: JSON.stringify({
      'receipt-data': receipt,
      password: Deno.env.get('APPLE_SHARED_SECRET'), // Get from App Store Connect
    }),
  });

  let data = await response.json();

  // If status 21007, retry with sandbox
  if (data.status === 21007) {
    response = await fetch(APPLE_VERIFY_URL.sandbox, {
      method: 'POST',
      body: JSON.stringify({
        'receipt-data': receipt,
        password: Deno.env.get('APPLE_SHARED_SECRET'),
      }),
    });
    data = await response.json();
  }

  if (data.status === 0) {
    // Valid receipt - update user subscription in database
    const latestReceipt = data.latest_receipt_info[0];
    const productId = latestReceipt.product_id;

    // Map product ID to tier
    let tier = 'seed';
    if (productId.includes('green')) tier = 'green';
    if (productId.includes('gold')) tier = 'gold';

    // Update subscription in Supabase
    // (Use service role key to bypass RLS)

    return new Response(JSON.stringify({ success: true, tier }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: false, error: data }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Get Apple Shared Secret:**

1. App Store Connect → My Apps → Harvest → Subscriptions
2. Click **App-Specific Shared Secret** → **Generate**
3. Copy to Supabase secrets: `supabase secrets set APPLE_SHARED_SECRET=your_secret`

---

## 🤖 Google Play Billing (Android)

### 1. Google Play Console Setup

#### A. Create Subscription Products

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **Harvest** app → **Monetize** → **Subscriptions**
3. Click **Create subscription**

**Green Subscription:**

- **Product ID**: `green_monthly`
- **Name**: `🟢 Green`
- **Description**: `Unlimited matches, values-based matching, 1 daily Gardener conversation (10,000 characters).`
- **Billing period**: Monthly
- **Price**: $9.99 USD
- **Free trial**: 7 days (optional)
- **Grace period**: 3 days (recommended)

**Gold Subscription:**

- **Product ID**: `gold_monthly`
- **Name**: `✨ Gold`
- **Description**: `Unlimited everything, see who likes you, full filters, unlimited Gardener (30,000 chars/day).`
- **Billing period**: Monthly
- **Price**: $19.99 USD

#### B. Enable Real-Time Developer Notifications

1. Go to **Monetize** → **Monetization setup**
2. Enable **Real-time developer notifications**
3. Set **Topic name**: `harvest-subscriptions`
4. Google will create a Pub/Sub topic

---

### 2. Backend Google Play Validation

**Create Supabase Edge Function:**

```bash
supabase functions new validate-google-receipt
```

**File**: `supabase/functions/validate-google-receipt/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleAuth } from 'https://esm.sh/@google-cloud/auth';

serve(async (req) => {
  const { purchaseToken, productId, userId } = await req.json();

  const auth = new GoogleAuth({
    credentials: JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')),
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const client = await auth.getClient();
  const packageName = 'com.harvest'; // Your Android package name

  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;

  const response = await client.request({ url });
  const subscription = response.data;

  // Check if subscription is active
  const isActive = subscription.expiryTimeMillis > Date.now();

  if (isActive) {
    // Update user subscription
    let tier = 'seed';
    if (productId.includes('green')) tier = 'green';
    if (productId.includes('gold')) tier = 'gold';

    return new Response(JSON.stringify({ success: true, tier }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: false }), {
    status: 400,
  });
});
```

**Get Google Service Account:**

1. Google Play Console → **Setup** → **API access**
2. Create service account in Google Cloud Console
3. Download JSON key file
4. Convert to string: `supabase secrets set GOOGLE_SERVICE_ACCOUNT_KEY="$(cat service-account.json)"`

---

## 🔗 Update Subscription Service

**File**: `lib/subscription.ts`

Add purchase handler:

```typescript
export async function handlePurchaseComplete(
  userId: string,
  productId: string,
  receiptData: string,
  platform: 'apple' | 'google'
): Promise<boolean> {
  try {
    // Determine tier from product ID
    let tierName: TierName = 'seed';
    if (productId.includes('green')) tierName = 'green';
    if (productId.includes('gold')) tierName = 'gold';

    // Validate receipt with backend
    const endpoint =
      platform === 'apple'
        ? 'https://your-project.supabase.co/functions/v1/validate-apple-receipt'
        : 'https://your-project.supabase.co/functions/v1/validate-google-receipt';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt: receiptData,
        userId,
        productId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Update subscription
      await upgradeSubscription(userId, tierName, platform, receiptData);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Purchase validation error:', error);
    return false;
  }
}
```

---

## 📝 Update Subscriptions Screen

**File**: `app/subscriptions.tsx`

Update `handleSubscribe`:

```typescript
import { appleIAP } from '../lib/iap/appleIAP';
import { handlePurchaseComplete } from '../lib/subscription';
import { useAuthStore } from '../stores/useAuthStore';

const handleSubscribe = async (planId: PlanType) => {
  if (planId === 'seed') {
    Alert.alert('Seed Plan', 'You are already on the free Seed plan!');
    return;
  }

  const { user } = useAuthStore.getState();
  if (!user?.id) {
    Alert.alert('Error', 'Please log in to subscribe');
    return;
  }

  try {
    // Get product ID based on tier
    const productId =
      planId === 'green'
        ? 'com.harvest.harvestdating.green.monthly'
        : 'com.harvest.harvestdating.gold.monthly';

    // Purchase subscription
    await appleIAP.purchaseSubscription(productId);

    // Purchase listener will handle validation
    Alert.alert('Success', 'Subscription activated!');
  } catch (error) {
    Alert.alert('Error', 'Failed to process subscription');
  }
};
```

---

## ✅ Testing

### iOS Testing (Sandbox)

1. **Create sandbox tester**:
   - App Store Connect → Users and Access → Sandbox Testers
   - Create test Apple ID (e.g., test@example.com)
2. **Test on device**:
   - Settings → App Store → Sandbox Account → Sign in with test account
   - Run app, try purchasing
   - Purchases are FREE in sandbox mode

### Android Testing

1. **Add testers**:
   - Google Play Console → Testing → License Testing
   - Add Gmail addresses of testers
2. **Install from Internal Testing track**
3. **Testers can purchase** (real money, but you get it back)

---

## 🚀 Production Checklist

- [ ] Apple Shared Secret set in Supabase
- [ ] Google Service Account key set in Supabase
- [ ] Receipt validation Edge Functions deployed
- [ ] Purchase listener set up in app
- [ ] Restore purchases button working
- [ ] Tested sandbox purchases
- [ ] Submitted for App Review
- [ ] Bank account connected for payouts

**Revenue Split:**

- Apple takes 30% (15% after year 1 per subscriber)
- Google takes 15%

---

## 🔒 Security Best Practices

1. **Always validate receipts server-side** (never trust client)
2. **Use environment variables** for secrets (never commit)
3. **Implement restore purchases** (required by Apple)
4. **Handle edge cases**: expired subscriptions, refunds, cancellations
5. **Log all transactions** for debugging

---

## 📚 Resources

- [Apple In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing Guide](https://developer.android.com/google/play/billing)
- [react-native-iap Docs](https://github.com/dooboolab-community/react-native-iap)
- [Expo IAP Guide](https://docs.expo.dev/guides/in-app-purchases/)
