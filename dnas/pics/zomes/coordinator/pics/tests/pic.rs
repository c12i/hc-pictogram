#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(unused_imports)]

use hdk::prelude::*;
use holochain::test_utils::consistency_10s;
use holochain::{conductor::config::ConductorConfig, sweettest::*};

use pics_integrity::*;

mod common;
use common::{create_pic, sample_pic_1, sample_pic_2};

#[tokio::test(flavor = "multi_thread")]
async fn create_pic_test() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join("../../../workdir/pics.dna");
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("pics", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (_bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("pics");

    let sample = sample_pic_1(&conductors[0], &alice_zome).await;

    // Alice creates a Pic
    let record: Record = create_pic(&conductors[0], &alice_zome, sample.clone()).await;
    let entry: Pic = record.entry().to_app_option().unwrap().unwrap();
    assert!(entry.eq(&sample));
}

#[tokio::test(flavor = "multi_thread")]
async fn create_and_read_pic() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join("../../../workdir/pics.dna");
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("pics", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("pics");
    let bob_zome = bobbo.zome("pics");

    let sample = sample_pic_1(&conductors[0], &alice_zome).await;

    // Alice creates a Pic
    let record: Record = create_pic(&conductors[0], &alice_zome, sample.clone()).await;

    consistency_10s([&alice, &bobbo]).await;

    let get_record: Option<Record> = conductors[1]
        .call(
            &bob_zome,
            "get_pic",
            record.signed_action.action_address().clone(),
        )
        .await;

    assert_eq!(record, get_record.unwrap());
}

#[tokio::test(flavor = "multi_thread")]
async fn create_and_delete_pic() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join("../../../workdir/pics.dna");
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("pics", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("pics");
    let bob_zome = bobbo.zome("pics");

    let sample_1 = sample_pic_1(&conductors[0], &alice_zome).await;

    // Alice creates a Pic
    let record: Record = create_pic(&conductors[0], &alice_zome, sample_1.clone()).await;
    let original_action_hash = record.signed_action.hashed.hash;

    // Alice deletes the Pic
    let delete_action_hash: ActionHash = conductors[0]
        .call(&alice_zome, "delete_pic", original_action_hash.clone())
        .await;

    consistency_10s([&alice, &bobbo]).await;

    let deletes: Vec<SignedActionHashed> = conductors[1]
        .call(
            &bob_zome,
            "get_all_deletes_for_pic",
            original_action_hash.clone(),
        )
        .await;

    assert_eq!(deletes.len(), 1);
    assert_eq!(deletes[0].hashed.hash, delete_action_hash);
}
