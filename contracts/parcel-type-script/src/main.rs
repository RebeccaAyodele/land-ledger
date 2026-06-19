#![no_std]
#![no_main]

use ckb_std::{
    ckb_constants::Source,
    ckb_types::prelude::*,
    high_level::{load_cell_data, load_cell_type, load_script},
    error::SysError,
};


ckb_std::entry!(program_entry);
ckb_std::default_alloc!();

fn read_parcel_id(data: &[u8]) -> Option<alloc::vec::Vec<u8>> {
    if data.len() < 28 {
        return None;
    }
    let start = u32::from_le_bytes(data[4..8].try_into().ok()?) as usize;
    let end = u32::from_le_bytes(data[8..12].try_into().ok()?) as usize;

    if start > end || end > data.len() {
        return None;
    }

    let vec_data = &data[start..end];
    if vec_data.len() < 4 {
        return None;
    }

    let content_len = u32::from_le_bytes(vec_data[0..4].try_into().ok()?) as usize;
    if vec_data.len() < 4 + content_len {
        return None;
    }

    Some(vec_data[4..4 + content_len].to_vec())
}

fn program_entry() -> i8 {
    let script = match load_script() {
        Ok(s) => s,
        Err(_) => return 1,
    };
    let script_hash = script.calc_script_hash();

    let mut input_ids: alloc::vec::Vec<alloc::vec::Vec<u8>> = alloc::vec::Vec::new();
    let mut i = 0;
    loop {
        match load_cell_type(i, Source::Input) {
            Ok(Some(t)) if t.calc_script_hash() == script_hash => {
                match load_cell_data(i, Source::Input) {
                    Ok(data) => {
                        if let Some(id) = read_parcel_id(&data) {
                            input_ids.push(id);
                        } else {
                            return 2;
                        }
                    }
                    Err(_) => return 3,
                }
            }
            Ok(_) => {}
            Err(SysError::IndexOutOfBound) => break,
            Err(_) => return 4,
        }
        i += 1;
    }

    let mut output_ids: alloc::vec::Vec<alloc::vec::Vec<u8>> = alloc::vec::Vec::new();
    let mut j = 0;
    loop {
        match load_cell_type(j, Source::Output) {
            Ok(Some(t)) if t.calc_script_hash() == script_hash => {
                match load_cell_data(j, Source::Output) {
                    Ok(data) => {
                        if let Some(id) = read_parcel_id(&data) {
                            output_ids.push(id);
                        } else {
                            return 5;
                        }
                    }
                    Err(_) => return 6,
                }
            }
            Ok(_) => {}
            Err(SysError::IndexOutOfBound) => break,
            Err(_) => return 7,
        }
        j += 1;
    }

    for input_id in &input_ids {
        if !output_ids.iter().any(|oid| oid == input_id) {
            return 8;
        }
    }

    0
}