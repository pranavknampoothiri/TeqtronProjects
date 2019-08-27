package com.example.pranav.androidqrcodefirebase;

import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.example.pranav.androidqrcodefirebase.Helper.GraphicOverlay;
import com.example.pranav.androidqrcodefirebase.Helper.RectOverlay;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.ml.vision.FirebaseVision;
import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcode;
import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcodeDetector;
import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcodeDetectorOptions;
import com.google.firebase.ml.vision.common.FirebaseVisionImage;
import com.wonderkiln.camerakit.CameraKitError;
import com.wonderkiln.camerakit.CameraKitEvent;
import com.wonderkiln.camerakit.CameraKitEventListener;
import com.wonderkiln.camerakit.CameraKitImage;
import com.wonderkiln.camerakit.CameraKitVideo;
import com.wonderkiln.camerakit.CameraView;

import org.json.JSONObject;

import java.util.List;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import dmax.dialog.SpotsDialog;

public class MainActivity extends AppCompatActivity {

    CameraView cameraView;
    Button btnDetect;
    android.app.AlertDialog waitingDialog;
    GraphicOverlay graphicOverlay;
    private TextView mTextViewResult;
    private RequestQueue mQueue;

    DatabaseReference databaseReference;

    @Override
    protected void onResume() {
        super.onResume();
        cameraView.start();
    }

    @Override
    protected void onPause() {
        super.onPause();
        cameraView.stop();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        System.out.println("Test3");

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

        databaseReference = FirebaseDatabase.getInstance().getReference("androidqrcodefirebase-ef0fe");

        /*
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        DatabaseReference myRef = database.getReference("androidqrcodefirebase-ef0fe");

        myRef.setValue("Hello, World!");
        */
        graphicOverlay = (GraphicOverlay)findViewById(R.id.graphic_overalay);
        cameraView = (CameraView)findViewById(R.id.cameraview);
        btnDetect = (Button)findViewById(R.id.btn_detect);
        //mTextViewResult = findViewById(R.id.text_list_view);
        mQueue = Volley.newRequestQueue(this);
        waitingDialog = new SpotsDialog.Builder()
                .setContext(this)
                .setMessage("Please wait")
                .setCancelable(false)
                .build();

        btnDetect.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                cameraView.start();
                cameraView.captureImage();
                graphicOverlay.clear();
            }
        });

        cameraView.addCameraKitListener(new CameraKitEventListener() {
            @Override
            public void onEvent(CameraKitEvent cameraKitEvent) {

            }

            @Override
            public void onError(CameraKitError cameraKitError) {

            }

            @Override
            public void onImage(CameraKitImage cameraKitImage) {
                System.out.println("Test4");
                waitingDialog.show();
                Bitmap bitmap = cameraKitImage.getBitmap();
                bitmap = Bitmap.createScaledBitmap(bitmap,cameraView.getWidth(),cameraView.getHeight(),false);
                cameraView.stop();
                System.out.println("Test5");
                runDetector(bitmap);
            }

            @Override
            public void onVideo(CameraKitVideo cameraKitVideo) {

            }
        });

        /*
        final String url = "https://jsonplaceholder.typicode.com/todos/1";

                    final Link link = new Link();
                    System.out.println("Test1");
                    JsonObjectRequest request = new JsonObjectRequest(Request.Method.GET, url, null,
                            new Response.Listener<JSONObject>() {
                                @Override
                                public void onResponse(JSONObject response) {
                                    System.out.println("Test2");
                                    System.out.println(response.optString("title"));
                                    System.out.println(response.optInt("id"));
                                    System.out.println(response.optBoolean("completed"));
                                    System.out.println(response.optInt("userId"));
                                    System.out.println(mQueue);
                                    String ttle = response.optString("title");
                                    int iD = response.optInt("id");
                                    Boolean cmplted = response.optBoolean("completed");
                                    int usrId = response.optInt("userId");
                                    link.setTitle(ttle);
                                    link.setId(iD);
                                    link.setCompleted(cmplted);
                                    link.setUserID(usrId);
                                    databaseReference.push().setValue(link);
                                    //mTextViewResult.append(ttle + ", " + String.valueOf(iD) + ", " + String.valueOf(cmplted) + ", " + String.valueOf(usrId) + "\n\n");
                                }
                            }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            error.printStackTrace();
                        }
                    });
                    */

    }


    private void runDetector(Bitmap bitmap) {
        System.out.println("Test6");
        FirebaseVisionImage image = FirebaseVisionImage.fromBitmap(bitmap);
        FirebaseVisionBarcodeDetectorOptions options = new FirebaseVisionBarcodeDetectorOptions.Builder()
                .setBarcodeFormats(
                        FirebaseVisionBarcode.FORMAT_QR_CODE,
                        FirebaseVisionBarcode.FORMAT_PDF417 //Or any type you want

                )
                .build();
        FirebaseVisionBarcodeDetector detector = FirebaseVision.getInstance().getVisionBarcodeDetector(options);

        System.out.println("Test7");
        detector.detectInImage(image)
                .addOnSuccessListener(new OnSuccessListener<List<FirebaseVisionBarcode>>() {
                    @Override
                    public void onSuccess(List<FirebaseVisionBarcode> firebaseVisionBarcodes) {
                        processResult(firebaseVisionBarcodes);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Toast.makeText(MainActivity.this, e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void processResult(List<FirebaseVisionBarcode> firebaseVisionBarcodes) {
        for (FirebaseVisionBarcode item : firebaseVisionBarcodes) {


            //Draw Rect
            Rect rectBounds = item.getBoundingBox();
            RectOverlay rectOverlay = new RectOverlay(graphicOverlay,rectBounds);
            graphicOverlay.add(rectOverlay);

            System.out.println("Hello?");
            int value_type = item.getValueType();
            switch(value_type) {
                case FirebaseVisionBarcode.TYPE_TEXT: {
                    AlertDialog.Builder builder = new AlertDialog.Builder(this);
                    builder.setMessage(item.getRawValue());
                    builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    });
                    AlertDialog dialog = builder.create();
                    dialog.show();
                }
                break;

                case FirebaseVisionBarcode.TYPE_URL:{
                    //Start browse url
                    Intent intent = new Intent(Intent.ACTION_VIEW,Uri.parse(item.getRawValue()));
                    startActivity(intent);
                    System.out.println("--------------------------------");
                    System.out.println(Uri.parse(item.getRawValue()));
                    System.out.println("--------------------------------");

                    /*
                    HttpClient httpclient = new DefaultHttpClient();
                    HttpGet httpget= new HttpGet(item.getRawValue());

                    HttpResponse response = httpclient.execute(httpget);

                    if(response.getStatusLine().getStatusCode()==200){
                        String server_response = EntityUtils.toString(response.getEntity());
                        Log.i("Server response", server_response );
                    } else {
                        Log.i("Server response", "Failed to get server response" );
                    }
                    */
                    final String url = item.getRawValue();
                    //final String url = "https://jsonplaceholder.typicode.com/todos/1";

                    final Link link = new Link();
                    JsonObjectRequest request = new JsonObjectRequest(Request.Method.GET, url, null,
                            new Response.Listener<JSONObject>() {
                                @Override
                                public void onResponse(JSONObject response) {
                                    System.out.println("Test2");
                                    System.out.println(response.optString("title"));
                                    System.out.println(response.optInt("id"));
                                    System.out.println(response.optBoolean("completed"));
                                    System.out.println(response.optInt("userId"));
                                    System.out.println(mQueue);
                                    String ttle = response.optString("title");
                                    int iD = response.optInt("id");
                                    Boolean cmplted = response.optBoolean("completed");
                                    int usrId = response.optInt("userId");
                                    link.setTitle(ttle);
                                    link.setId(iD);
                                    link.setCompleted(cmplted);
                                    link.setUserID(usrId);
                                    databaseReference.push().setValue(link);
                                    //mTextViewResult.append(ttle + ", " + String.valueOf(iD) + ", " + String.valueOf(cmplted) + ", " + String.valueOf(usrId) + "\n\n");
                                }
                            }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            error.printStackTrace();
                        }
                    });
                    mQueue.add(request);
                    Toast.makeText(this, "Link added", Toast.LENGTH_SHORT).show();

                }
                break;


                case FirebaseVisionBarcode.TYPE_CONTACT_INFO: {
                    String info  = new StringBuilder("Name: ")
                            .append(item.getContactInfo().getName().getFormattedName())
                            .append("\n")
                            .append("Address: ")
                            .append(item.getContactInfo().getAddresses().get(0).getAddressLines())
                            .append("\n")
                            .append("Email: ")
                            .append(item.getContactInfo().getEmails().get(0).getAddress())
                            .toString();
                    AlertDialog.Builder builder = new AlertDialog.Builder(this);
                    builder.setMessage(info);
                    builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    });
                    AlertDialog dialog = builder.create();
                    dialog.show();
                }
                break;

                default:
                    break;
            }
        }
        waitingDialog.dismiss();
    }

}
