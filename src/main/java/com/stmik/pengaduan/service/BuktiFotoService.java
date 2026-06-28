package com.stmik.pengaduan.service;

import com.stmik.pengaduan.entity.BuktiFoto;
import com.stmik.pengaduan.entity.Pengaduan;
import com.stmik.pengaduan.exception.BadRequestException;
import com.stmik.pengaduan.exception.ResourceNotFoundException;
import com.stmik.pengaduan.repository.BuktiFotoRepository;
import com.stmik.pengaduan.repository.PengaduanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class BuktiFotoService {

    @Autowired private BuktiFotoRepository buktiFotoRepo;
    @Autowired private PengaduanRepository pengaduanRepo;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public BuktiFoto upload(Integer pengaduanId, MultipartFile file, String uploadedBy) throws IOException {
        Pengaduan pengaduan = pengaduanRepo.findById(pengaduanId)
            .orElseThrow(() -> new ResourceNotFoundException("Pengaduan tidak ditemukan"));

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Format file tidak valid. Hanya menerima file gambar");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Ukuran file maksimal 5MB");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = getExtension(file.getOriginalFilename());
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        BuktiFoto bukti = new BuktiFoto();
        bukti.setPengaduan(pengaduan);
        bukti.setNamaFile(file.getOriginalFilename());
        bukti.setUrlFile(uploadDir + "/" + uniqueFilename);
        bukti.setTipeFile(contentType);
        bukti.setUploadedBy(uploadedBy);
        return buktiFotoRepo.save(bukti);
    }

    public List<BuktiFoto> getByPengaduan(Integer pengaduanId) {
        return buktiFotoRepo.findByPengaduanId(pengaduanId);
    }

    @Transactional
    public void hapus(Integer id) {
        BuktiFoto bukti = buktiFotoRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("File bukti tidak ditemukan"));
        try {
            Files.deleteIfExists(Paths.get(bukti.getUrlFile()));
        } catch (IOException e) {
            System.out.println("Gagal hapus file: " + e.getMessage());
        }
        buktiFotoRepo.delete(bukti);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}