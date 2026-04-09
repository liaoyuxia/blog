package com.linstudio.blog.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;

@Entity
@Table(name = "site_settings")
public class SiteSettings {
    @Id
    private Long id;

    @Column(name = "brand_name", nullable = false, length = 80)
    private String brandName;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "role_zh", nullable = false, length = 160)
    private String roleZh;

    @Column(name = "role_en", nullable = false, length = 160)
    private String roleEn;

    @Lob
    @Column(name = "bio_zh", nullable = false)
    private String bioZh;

    @Lob
    @Column(name = "bio_en", nullable = false)
    private String bioEn;

    @Column(name = "location_zh", nullable = false, length = 120)
    private String locationZh;

    @Column(name = "location_en", nullable = false, length = 120)
    private String locationEn;

    @Column(nullable = false, length = 160)
    private String email;

    @Lob
    @Column(name = "specialties_zh", nullable = false)
    private String specialtiesZh;

    @Lob
    @Column(name = "specialties_en", nullable = false)
    private String specialtiesEn;

    @Column(name = "hero_eyebrow_zh", nullable = false, length = 160)
    private String heroEyebrowZh;

    @Column(name = "hero_eyebrow_en", nullable = false, length = 160)
    private String heroEyebrowEn;

    @Column(name = "hero_title_zh", nullable = false, length = 200)
    private String heroTitleZh;

    @Column(name = "hero_title_en", nullable = false, length = 200)
    private String heroTitleEn;

    @Lob
    @Column(name = "hero_description_zh", nullable = false)
    private String heroDescriptionZh;

    @Lob
    @Column(name = "hero_description_en", nullable = false)
    private String heroDescriptionEn;

    @Column(name = "onboarding_title_zh", nullable = false, length = 160)
    private String onboardingTitleZh;

    @Column(name = "onboarding_title_en", nullable = false, length = 160)
    private String onboardingTitleEn;

    @Lob
    @Column(name = "onboarding_description_zh", nullable = false)
    private String onboardingDescriptionZh;

    @Lob
    @Column(name = "onboarding_description_en", nullable = false)
    private String onboardingDescriptionEn;

    @Column(name = "home_about_title_zh", nullable = false, length = 160)
    private String homeAboutTitleZh;

    @Column(name = "home_about_title_en", nullable = false, length = 160)
    private String homeAboutTitleEn;

    @Lob
    @Column(name = "home_about_description_zh", nullable = false)
    private String homeAboutDescriptionZh;

    @Lob
    @Column(name = "home_about_description_en", nullable = false)
    private String homeAboutDescriptionEn;

    @Column(name = "home_pillars_title_zh", nullable = false, length = 160)
    private String homePillarsTitleZh;

    @Column(name = "home_pillars_title_en", nullable = false, length = 160)
    private String homePillarsTitleEn;

    @Lob
    @Column(name = "home_pillars_zh", nullable = false)
    private String homePillarsZh;

    @Lob
    @Column(name = "home_pillars_en", nullable = false)
    private String homePillarsEn;

    @Column(name = "home_journey_title_zh", nullable = false, length = 160)
    private String homeJourneyTitleZh;

    @Column(name = "home_journey_title_en", nullable = false, length = 160)
    private String homeJourneyTitleEn;

    @Lob
    @Column(name = "home_journey_description_zh", nullable = false)
    private String homeJourneyDescriptionZh;

    @Lob
    @Column(name = "home_journey_description_en", nullable = false)
    private String homeJourneyDescriptionEn;

    @Column(name = "subscribe_title_zh", nullable = false, length = 160)
    private String subscribeTitleZh;

    @Column(name = "subscribe_title_en", nullable = false, length = 160)
    private String subscribeTitleEn;

    @Lob
    @Column(name = "subscribe_description_zh", nullable = false)
    private String subscribeDescriptionZh;

    @Lob
    @Column(name = "subscribe_description_en", nullable = false)
    private String subscribeDescriptionEn;

    @Column(name = "subscribe_link_label_zh", nullable = false, length = 120)
    private String subscribeLinkLabelZh;

    @Column(name = "subscribe_link_label_en", nullable = false, length = 120)
    private String subscribeLinkLabelEn;

    @Column(name = "subscribe_link_url", nullable = false, length = 255)
    private String subscribeLinkUrl;

    @Column(name = "journal_title_zh", nullable = false, length = 160)
    private String journalTitleZh;

    @Column(name = "journal_title_en", nullable = false, length = 160)
    private String journalTitleEn;

    @Lob
    @Column(name = "journal_description_zh", nullable = false)
    private String journalDescriptionZh;

    @Lob
    @Column(name = "journal_description_en", nullable = false)
    private String journalDescriptionEn;

    @Column(name = "message_title_zh", nullable = false, length = 160)
    private String messageTitleZh;

    @Column(name = "message_title_en", nullable = false, length = 160)
    private String messageTitleEn;

    @Lob
    @Column(name = "message_description_zh", nullable = false)
    private String messageDescriptionZh;

    @Lob
    @Column(name = "message_description_en", nullable = false)
    private String messageDescriptionEn;

    @Column(name = "footer_product_zh", nullable = false, length = 120)
    private String footerProductZh;

    @Column(name = "footer_product_en", nullable = false, length = 120)
    private String footerProductEn;

    @Column(name = "footer_stack_zh", nullable = false, length = 120)
    private String footerStackZh;

    @Column(name = "footer_stack_en", nullable = false, length = 120)
    private String footerStackEn;

    @Column(name = "visit_count", nullable = false)
    private long visitCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getRoleZh() {
        return roleZh;
    }

    public void setRoleZh(String roleZh) {
        this.roleZh = roleZh;
    }

    public String getRoleEn() {
        return roleEn;
    }

    public void setRoleEn(String roleEn) {
        this.roleEn = roleEn;
    }

    public String getBioZh() {
        return bioZh;
    }

    public void setBioZh(String bioZh) {
        this.bioZh = bioZh;
    }

    public String getBioEn() {
        return bioEn;
    }

    public void setBioEn(String bioEn) {
        this.bioEn = bioEn;
    }

    public String getLocationZh() {
        return locationZh;
    }

    public void setLocationZh(String locationZh) {
        this.locationZh = locationZh;
    }

    public String getLocationEn() {
        return locationEn;
    }

    public void setLocationEn(String locationEn) {
        this.locationEn = locationEn;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSpecialtiesZh() {
        return specialtiesZh;
    }

    public void setSpecialtiesZh(String specialtiesZh) {
        this.specialtiesZh = specialtiesZh;
    }

    public String getSpecialtiesEn() {
        return specialtiesEn;
    }

    public void setSpecialtiesEn(String specialtiesEn) {
        this.specialtiesEn = specialtiesEn;
    }

    public String getHeroEyebrowZh() {
        return heroEyebrowZh;
    }

    public void setHeroEyebrowZh(String heroEyebrowZh) {
        this.heroEyebrowZh = heroEyebrowZh;
    }

    public String getHeroEyebrowEn() {
        return heroEyebrowEn;
    }

    public void setHeroEyebrowEn(String heroEyebrowEn) {
        this.heroEyebrowEn = heroEyebrowEn;
    }

    public String getHeroTitleZh() {
        return heroTitleZh;
    }

    public void setHeroTitleZh(String heroTitleZh) {
        this.heroTitleZh = heroTitleZh;
    }

    public String getHeroTitleEn() {
        return heroTitleEn;
    }

    public void setHeroTitleEn(String heroTitleEn) {
        this.heroTitleEn = heroTitleEn;
    }

    public String getHeroDescriptionZh() {
        return heroDescriptionZh;
    }

    public void setHeroDescriptionZh(String heroDescriptionZh) {
        this.heroDescriptionZh = heroDescriptionZh;
    }

    public String getHeroDescriptionEn() {
        return heroDescriptionEn;
    }

    public void setHeroDescriptionEn(String heroDescriptionEn) {
        this.heroDescriptionEn = heroDescriptionEn;
    }

    public String getOnboardingTitleZh() {
        return onboardingTitleZh;
    }

    public void setOnboardingTitleZh(String onboardingTitleZh) {
        this.onboardingTitleZh = onboardingTitleZh;
    }

    public String getOnboardingTitleEn() {
        return onboardingTitleEn;
    }

    public void setOnboardingTitleEn(String onboardingTitleEn) {
        this.onboardingTitleEn = onboardingTitleEn;
    }

    public String getOnboardingDescriptionZh() {
        return onboardingDescriptionZh;
    }

    public void setOnboardingDescriptionZh(String onboardingDescriptionZh) {
        this.onboardingDescriptionZh = onboardingDescriptionZh;
    }

    public String getOnboardingDescriptionEn() {
        return onboardingDescriptionEn;
    }

    public void setOnboardingDescriptionEn(String onboardingDescriptionEn) {
        this.onboardingDescriptionEn = onboardingDescriptionEn;
    }

    public String getHomeAboutTitleZh() {
        return homeAboutTitleZh;
    }

    public void setHomeAboutTitleZh(String homeAboutTitleZh) {
        this.homeAboutTitleZh = homeAboutTitleZh;
    }

    public String getHomeAboutTitleEn() {
        return homeAboutTitleEn;
    }

    public void setHomeAboutTitleEn(String homeAboutTitleEn) {
        this.homeAboutTitleEn = homeAboutTitleEn;
    }

    public String getHomeAboutDescriptionZh() {
        return homeAboutDescriptionZh;
    }

    public void setHomeAboutDescriptionZh(String homeAboutDescriptionZh) {
        this.homeAboutDescriptionZh = homeAboutDescriptionZh;
    }

    public String getHomeAboutDescriptionEn() {
        return homeAboutDescriptionEn;
    }

    public void setHomeAboutDescriptionEn(String homeAboutDescriptionEn) {
        this.homeAboutDescriptionEn = homeAboutDescriptionEn;
    }

    public String getHomePillarsTitleZh() {
        return homePillarsTitleZh;
    }

    public void setHomePillarsTitleZh(String homePillarsTitleZh) {
        this.homePillarsTitleZh = homePillarsTitleZh;
    }

    public String getHomePillarsTitleEn() {
        return homePillarsTitleEn;
    }

    public void setHomePillarsTitleEn(String homePillarsTitleEn) {
        this.homePillarsTitleEn = homePillarsTitleEn;
    }

    public String getHomePillarsZh() {
        return homePillarsZh;
    }

    public void setHomePillarsZh(String homePillarsZh) {
        this.homePillarsZh = homePillarsZh;
    }

    public String getHomePillarsEn() {
        return homePillarsEn;
    }

    public void setHomePillarsEn(String homePillarsEn) {
        this.homePillarsEn = homePillarsEn;
    }

    public String getHomeJourneyTitleZh() {
        return homeJourneyTitleZh;
    }

    public void setHomeJourneyTitleZh(String homeJourneyTitleZh) {
        this.homeJourneyTitleZh = homeJourneyTitleZh;
    }

    public String getHomeJourneyTitleEn() {
        return homeJourneyTitleEn;
    }

    public void setHomeJourneyTitleEn(String homeJourneyTitleEn) {
        this.homeJourneyTitleEn = homeJourneyTitleEn;
    }

    public String getHomeJourneyDescriptionZh() {
        return homeJourneyDescriptionZh;
    }

    public void setHomeJourneyDescriptionZh(String homeJourneyDescriptionZh) {
        this.homeJourneyDescriptionZh = homeJourneyDescriptionZh;
    }

    public String getHomeJourneyDescriptionEn() {
        return homeJourneyDescriptionEn;
    }

    public void setHomeJourneyDescriptionEn(String homeJourneyDescriptionEn) {
        this.homeJourneyDescriptionEn = homeJourneyDescriptionEn;
    }

    public String getSubscribeTitleZh() {
        return subscribeTitleZh;
    }

    public void setSubscribeTitleZh(String subscribeTitleZh) {
        this.subscribeTitleZh = subscribeTitleZh;
    }

    public String getSubscribeTitleEn() {
        return subscribeTitleEn;
    }

    public void setSubscribeTitleEn(String subscribeTitleEn) {
        this.subscribeTitleEn = subscribeTitleEn;
    }

    public String getSubscribeDescriptionZh() {
        return subscribeDescriptionZh;
    }

    public void setSubscribeDescriptionZh(String subscribeDescriptionZh) {
        this.subscribeDescriptionZh = subscribeDescriptionZh;
    }

    public String getSubscribeDescriptionEn() {
        return subscribeDescriptionEn;
    }

    public void setSubscribeDescriptionEn(String subscribeDescriptionEn) {
        this.subscribeDescriptionEn = subscribeDescriptionEn;
    }

    public String getSubscribeLinkLabelZh() {
        return subscribeLinkLabelZh;
    }

    public void setSubscribeLinkLabelZh(String subscribeLinkLabelZh) {
        this.subscribeLinkLabelZh = subscribeLinkLabelZh;
    }

    public String getSubscribeLinkLabelEn() {
        return subscribeLinkLabelEn;
    }

    public void setSubscribeLinkLabelEn(String subscribeLinkLabelEn) {
        this.subscribeLinkLabelEn = subscribeLinkLabelEn;
    }

    public String getSubscribeLinkUrl() {
        return subscribeLinkUrl;
    }

    public void setSubscribeLinkUrl(String subscribeLinkUrl) {
        this.subscribeLinkUrl = subscribeLinkUrl;
    }

    public String getJournalTitleZh() {
        return journalTitleZh;
    }

    public void setJournalTitleZh(String journalTitleZh) {
        this.journalTitleZh = journalTitleZh;
    }

    public String getJournalTitleEn() {
        return journalTitleEn;
    }

    public void setJournalTitleEn(String journalTitleEn) {
        this.journalTitleEn = journalTitleEn;
    }

    public String getJournalDescriptionZh() {
        return journalDescriptionZh;
    }

    public void setJournalDescriptionZh(String journalDescriptionZh) {
        this.journalDescriptionZh = journalDescriptionZh;
    }

    public String getJournalDescriptionEn() {
        return journalDescriptionEn;
    }

    public void setJournalDescriptionEn(String journalDescriptionEn) {
        this.journalDescriptionEn = journalDescriptionEn;
    }

    public String getMessageTitleZh() {
        return messageTitleZh;
    }

    public void setMessageTitleZh(String messageTitleZh) {
        this.messageTitleZh = messageTitleZh;
    }

    public String getMessageTitleEn() {
        return messageTitleEn;
    }

    public void setMessageTitleEn(String messageTitleEn) {
        this.messageTitleEn = messageTitleEn;
    }

    public String getMessageDescriptionZh() {
        return messageDescriptionZh;
    }

    public void setMessageDescriptionZh(String messageDescriptionZh) {
        this.messageDescriptionZh = messageDescriptionZh;
    }

    public String getMessageDescriptionEn() {
        return messageDescriptionEn;
    }

    public void setMessageDescriptionEn(String messageDescriptionEn) {
        this.messageDescriptionEn = messageDescriptionEn;
    }

    public String getFooterProductZh() {
        return footerProductZh;
    }

    public void setFooterProductZh(String footerProductZh) {
        this.footerProductZh = footerProductZh;
    }

    public String getFooterProductEn() {
        return footerProductEn;
    }

    public void setFooterProductEn(String footerProductEn) {
        this.footerProductEn = footerProductEn;
    }

    public String getFooterStackZh() {
        return footerStackZh;
    }

    public void setFooterStackZh(String footerStackZh) {
        this.footerStackZh = footerStackZh;
    }

    public String getFooterStackEn() {
        return footerStackEn;
    }

    public void setFooterStackEn(String footerStackEn) {
        this.footerStackEn = footerStackEn;
    }

    public long getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(long visitCount) {
        this.visitCount = visitCount;
    }
}
