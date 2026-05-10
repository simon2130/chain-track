package com.ctbe.yaredandsimon.service;

import com.ctbe.yaredandsimon.entity.Batch;
import com.ctbe.yaredandsimon.entity.Product;
import com.ctbe.yaredandsimon.entity.QRToken;
import com.ctbe.yaredandsimon.entity.User;
import com.ctbe.yaredandsimon.exception.AccessDeniedException;
import com.ctbe.yaredandsimon.exception.InvalidOperationException;
import com.ctbe.yaredandsimon.exception.ResourceNotFoundException;
import com.ctbe.yaredandsimon.repository.BatchRepository;
import com.ctbe.yaredandsimon.repository.ProductRepository;
import com.ctbe.yaredandsimon.repository.QRTokenRepository;
import com.ctbe.yaredandsimon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final QRTokenRepository qrTokenRepository;
    private final QRCodeService qrCodeService;

    @Transactional
    public Batch createBatch(Long productId, Integer quantity,
                             LocalDate manufacturedDate, LocalDate expiryDate,
                             String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // BOLA check — user must belong to the same org as the product creator
        if (!product.getCreatedBy().getOrganization().getId()
                .equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("You can only create batches for your organization's products");
        }

        String batchNumber = generateBatchNumber(product.getSku());

        Batch batch = Batch.builder()
                .batchNumber(batchNumber)
                .product(product)
                .quantity(quantity)
                .manufacturedDate(manufacturedDate)
                .expiryDate(expiryDate)
                .build();

        return batchRepository.save(batch);
    }

    @Transactional(readOnly = true)
    public Batch getBatchById(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
    }

    @Transactional
    public QRToken generateQRCode(Long batchId, String baseUrl) {
        if (qrTokenRepository.existsByBatchId(batchId)) {
            throw new InvalidOperationException("QR code already exists for this batch");
        }

        Batch batch = getBatchById(batchId);
        String token = UUID.randomUUID().toString();
        String verifyUrl = baseUrl + "/api/verify/" + token;
        String base64Image = qrCodeService.generateQRCodeBase64(verifyUrl);

        QRToken qrToken = QRToken.builder()
                .batch(batch)
                .tokenValue(token)
                .qrImageBase64(base64Image)
                .build();

        return qrTokenRepository.save(qrToken);
    }

    private String generateBatchNumber(String sku) {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString()
                .replace("-", "").substring(0, 8).toUpperCase();
        return sku + "-" + date + "-" + uuid;
    }
}