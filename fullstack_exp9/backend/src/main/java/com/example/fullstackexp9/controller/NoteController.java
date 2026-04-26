package com.example.fullstackexp9.controller;

import com.example.fullstackexp9.model.Note;
import com.example.fullstackexp9.repository.NoteRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteController {
    private final NoteRepository repository;

    public NoteController(NoteRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Note> findAll() {
        return repository.findAll();
    }

    @PostMapping
    public Note create(@RequestBody Note note) {
        return repository.save(note);
    }
}
