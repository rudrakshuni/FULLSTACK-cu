package com.example.fullstackexp9.repository;

import com.example.fullstackexp9.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
}
