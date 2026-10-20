/*
 * IInAppBillingService — استاب AIDL نسخه ۳ صورت‌حساب درون‌برنامه‌ای
 * بازنویسی‌شده برای فروشگاه مایکت (ir.mservices.market) — همان پروتکل استاندارد v3.
 * این فایل معادل خروجی استاندارد کامپایلر AIDL برای رابط IInAppBillingService است.
 */
package ir.mservices.market;

public interface IInAppBillingService extends android.os.IInterface {

    /** پشتیبانی از نوع صورت‌حساب (inapp / subs) بررسی می‌شود */
    int isBillingSupported(int apiVersion, String packageName, String type) throws android.os.RemoteException;

    /** دریافت اطلاعات محصولات (قیمت، عنوان، توضیحات) */
    android.os.Bundle getSkuDetails(int apiVersion, String packageName, String type, android.os.Bundle skusBundle) throws android.os.RemoteException;

    /** دریافت PendingIntent برای شروع فرایند خرید */
    android.os.Bundle getBuyIntent(int apiVersion, String packageName, String sku, String type, String developerPayload) throws android.os.RemoteException;

    /** دریافت لیست خریدهای مالک‌شده کاربر */
    android.os.Bundle getPurchases(int apiVersion, String packageName, String type, String continuationToken) throws android.os.RemoteException;

    /** مصرف کردن خرید (برای محصولات مصرفی) */
    int consumePurchase(int apiVersion, String packageName, String purchaseToken) throws android.os.RemoteException;

    /** Local-side IPC implementation stub class. */
    public static abstract class Stub extends android.os.Binder implements ir.mservices.market.IInAppBillingService {

        private static final String DESCRIPTOR = "ir.mservices.market.IInAppBillingService";

        /** Construct the stub at attach it to the interface. */
        public Stub() {
            this.attachInterface(this, DESCRIPTOR);
        }

        public static ir.mservices.market.IInAppBillingService asInterface(android.os.IBinder obj) {
            if ((obj == null)) return null;
            android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
            if (((iin != null) && (iin instanceof ir.mservices.market.IInAppBillingService))) {
                return ((ir.mservices.market.IInAppBillingService) iin);
            }
            return new ir.mservices.market.IInAppBillingService.Stub.Proxy(obj);
        }

        @Override
        public android.os.IBinder asBinder() {
            return this;
        }

        @Override
        public boolean onTransact(int code, android.os.Parcel data, android.os.Parcel reply, int flags) throws android.os.RemoteException {
            switch (code) {
                case INTERFACE_TRANSACTION: {
                    reply.writeString(DESCRIPTOR);
                    return true;
                }
                case TRANSACTION_isBillingSupported: {
                    data.enforceInterface(DESCRIPTOR);
                    int _arg0;
                    _arg0 = data.readInt();
                    String _arg1;
                    _arg1 = data.readString();
                    String _arg2;
                    _arg2 = data.readString();
                    int _result = this.isBillingSupported(_arg0, _arg1, _arg2);
                    reply.writeNoException();
                    reply.writeInt(_result);
                    return true;
                }
                case TRANSACTION_getSkuDetails: {
                    data.enforceInterface(DESCRIPTOR);
                    int _arg0;
                    _arg0 = data.readInt();
                    String _arg1;
                    _arg1 = data.readString();
                    String _arg2;
                    _arg2 = data.readString();
                    android.os.Bundle _arg3;
                    if ((0 != data.readInt())) {
                        _arg3 = android.os.Bundle.CREATOR.createFromParcel(data);
                    } else {
                        _arg3 = null;
                    }
                    android.os.Bundle _result = this.getSkuDetails(_arg0, _arg1, _arg2, _arg3);
                    reply.writeNoException();
                    if ((_result != null)) {
                        reply.writeInt(1);
                        _result.writeToParcel(reply, android.os.Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
                    } else {
                        reply.writeInt(0);
                    }
                    return true;
                }
                case TRANSACTION_getBuyIntent: {
                    data.enforceInterface(DESCRIPTOR);
                    int _arg0;
                    _arg0 = data.readInt();
                    String _arg1;
                    _arg1 = data.readString();
                    String _arg2;
                    _arg2 = data.readString();
                    String _arg3;
                    _arg3 = data.readString();
                    String _arg4;
                    _arg4 = data.readString();
                    android.os.Bundle _result = this.getBuyIntent(_arg0, _arg1, _arg2, _arg3, _arg4);
                    reply.writeNoException();
                    if ((_result != null)) {
                        reply.writeInt(1);
                        _result.writeToParcel(reply, android.os.Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
                    } else {
                        reply.writeInt(0);
                    }
                    return true;
                }
                case TRANSACTION_getPurchases: {
                    data.enforceInterface(DESCRIPTOR);
                    int _arg0;
                    _arg0 = data.readInt();
                    String _arg1;
                    _arg1 = data.readString();
                    String _arg2;
                    _arg2 = data.readString();
                    String _arg3;
                    _arg3 = data.readString();
                    android.os.Bundle _result = this.getPurchases(_arg0, _arg1, _arg2, _arg3);
                    reply.writeNoException();
                    if ((_result != null)) {
                        reply.writeInt(1);
                        _result.writeToParcel(reply, android.os.Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
                    } else {
                        reply.writeInt(0);
                    }
                    return true;
                }
                case TRANSACTION_consumePurchase: {
                    data.enforceInterface(DESCRIPTOR);
                    int _arg0;
                    _arg0 = data.readInt();
                    String _arg1;
                    _arg1 = data.readString();
                    String _arg2;
                    _arg2 = data.readString();
                    int _result = this.consumePurchase(_arg0, _arg1, _arg2);
                    reply.writeNoException();
                    reply.writeInt(_result);
                    return true;
                }
            }
            return super.onTransact(code, data, reply, flags);
        }

        private static class Proxy implements ir.mservices.market.IInAppBillingService {
            private android.os.IBinder mRemote;

            Proxy(android.os.IBinder remote) {
                mRemote = remote;
            }

            @Override
            public android.os.IBinder asBinder() {
                return mRemote;
            }

            public String getInterfaceDescriptor() {
                return DESCRIPTOR;
            }

            @Override
            public int isBillingSupported(int apiVersion, String packageName, String type) throws android.os.RemoteException {
                android.os.Parcel _data = android.os.Parcel.obtain();
                android.os.Parcel _reply = android.os.Parcel.obtain();
                int _result;
                try {
                    _data.writeInterfaceToken(DESCRIPTOR);
                    _data.writeInt(apiVersion);
                    _data.writeString(packageName);
                    _data.writeString(type);
                    mRemote.transact(Stub.TRANSACTION_isBillingSupported, _data, _reply, 0);
                    _reply.readException();
                    _result = _reply.readInt();
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
                return _result;
            }

            @Override
            public android.os.Bundle getSkuDetails(int apiVersion, String packageName, String type, android.os.Bundle skusBundle) throws android.os.RemoteException {
                android.os.Parcel _data = android.os.Parcel.obtain();
                android.os.Parcel _reply = android.os.Parcel.obtain();
                android.os.Bundle _result;
                try {
                    _data.writeInterfaceToken(DESCRIPTOR);
                    _data.writeInt(apiVersion);
                    _data.writeString(packageName);
                    _data.writeString(type);
                    if ((skusBundle != null)) {
                        _data.writeInt(1);
                        skusBundle.writeToParcel(_data, 0);
                    } else {
                        _data.writeInt(0);
                    }
                    mRemote.transact(Stub.TRANSACTION_getSkuDetails, _data, _reply, 0);
                    _reply.readException();
                    _result = (0 != _reply.readInt()) ? android.os.Bundle.CREATOR.createFromParcel(_reply) : null;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
                return _result;
            }

            @Override
            public android.os.Bundle getBuyIntent(int apiVersion, String packageName, String sku, String type, String developerPayload) throws android.os.RemoteException {
                android.os.Parcel _data = android.os.Parcel.obtain();
                android.os.Parcel _reply = android.os.Parcel.obtain();
                android.os.Bundle _result;
                try {
                    _data.writeInterfaceToken(DESCRIPTOR);
                    _data.writeInt(apiVersion);
                    _data.writeString(packageName);
                    _data.writeString(sku);
                    _data.writeString(type);
                    _data.writeString(developerPayload);
                    mRemote.transact(Stub.TRANSACTION_getBuyIntent, _data, _reply, 0);
                    _reply.readException();
                    _result = (0 != _reply.readInt()) ? android.os.Bundle.CREATOR.createFromParcel(_reply) : null;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
                return _result;
            }

            @Override
            public android.os.Bundle getPurchases(int apiVersion, String packageName, String type, String continuationToken) throws android.os.RemoteException {
                android.os.Parcel _data = android.os.Parcel.obtain();
                android.os.Parcel _reply = android.os.Parcel.obtain();
                android.os.Bundle _result;
                try {
                    _data.writeInterfaceToken(DESCRIPTOR);
                    _data.writeInt(apiVersion);
                    _data.writeString(packageName);
                    _data.writeString(type);
                    _data.writeString(continuationToken);
                    mRemote.transact(Stub.TRANSACTION_getPurchases, _data, _reply, 0);
                    _reply.readException();
                    _result = (0 != _reply.readInt()) ? android.os.Bundle.CREATOR.createFromParcel(_reply) : null;
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
                return _result;
            }

            @Override
            public int consumePurchase(int apiVersion, String packageName, String purchaseToken) throws android.os.RemoteException {
                android.os.Parcel _data = android.os.Parcel.obtain();
                android.os.Parcel _reply = android.os.Parcel.obtain();
                int _result;
                try {
                    _data.writeInterfaceToken(DESCRIPTOR);
                    _data.writeInt(apiVersion);
                    _data.writeString(packageName);
                    _data.writeString(purchaseToken);
                    mRemote.transact(Stub.TRANSACTION_consumePurchase, _data, _reply, 0);
                    _reply.readException();
                    _result = _reply.readInt();
                } finally {
                    _reply.recycle();
                    _data.recycle();
                }
                return _result;
            }
        }

        static final int TRANSACTION_isBillingSupported = (android.os.IBinder.FIRST_CALL_TRANSACTION + 0);
        static final int TRANSACTION_getSkuDetails = (android.os.IBinder.FIRST_CALL_TRANSACTION + 1);
        static final int TRANSACTION_getBuyIntent = (android.os.IBinder.FIRST_CALL_TRANSACTION + 2);
        static final int TRANSACTION_getPurchases = (android.os.IBinder.FIRST_CALL_TRANSACTION + 3);
        static final int TRANSACTION_consumePurchase = (android.os.IBinder.FIRST_CALL_TRANSACTION + 4);
    }
}
