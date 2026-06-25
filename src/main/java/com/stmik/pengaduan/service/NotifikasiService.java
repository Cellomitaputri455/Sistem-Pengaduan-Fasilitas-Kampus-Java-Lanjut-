package com.stmik.pengaduan.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class NotifikasiService {

    @Value("${fonnte.token}")
    private String fonnteToken;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void kirimWA(String noHp, String pesan) {
        try {
            String body = "target=" + noHp + "&message=" + pesan;

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.fonnte.com/send"))
                .header("Authorization", fonnteToken)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

            System.out.println("[NOTIFIKASI] WA terkirim ke " + noHp + " | Response: " + response.body());

        } catch (Exception e) {
            System.out.println("[NOTIFIKASI] Gagal kirim WA: " + e.getMessage());
        }
    }
}