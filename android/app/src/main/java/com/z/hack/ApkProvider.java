package com.z.hack;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;

import java.io.File;
import java.io.FileNotFoundException;

/**
 * ContentProvider داخلی برای اشتراک‌گذاری امن فایل APK دانلودشده با نصاب سیستم.
 * روی API 24 به بالا پاس‌دادن file:// در Intent ممنوع است؛ بنابراین فایل از طریق
 * یک URI امن به شکل content://com.abbastech.antihack.update/<مسیر فایل> در اختیار
 * نصاب قرار می‌گیرد (بدون نیاز به کتابخانه اندرویدایکس FileProvider).
 */
public class ApkProvider extends ContentProvider {

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File f = new File(uri.getPath() != null ? uri.getPath() : "/");
        if (!f.exists()) throw new FileNotFoundException(uri.getPath());
        return ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        return null;
    }

    @Override
    public String getType(Uri uri) {
        return "application/vnd.android.package-archive";
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) {
        return null;
    }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        return 0;
    }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
        return 0;
    }
}
