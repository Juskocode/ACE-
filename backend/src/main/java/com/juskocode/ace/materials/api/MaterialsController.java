package com.juskocode.ace.materials.api;

import com.juskocode.ace.materials.application.MaterialsService;
import com.juskocode.ace.materials.domain.MaterialItem;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/materials")
public class MaterialsController {
    private final MaterialsService service;

    public MaterialsController(MaterialsService service) {
        this.service = service;
    }

    @GetMapping
    public List<MaterialItem> list() {
        return service.list();
    }
}
