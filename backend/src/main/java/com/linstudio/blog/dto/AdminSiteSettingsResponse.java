package com.linstudio.blog.dto;

import java.util.List;

public class AdminSiteSettingsResponse {
    private final String brandName;
    private final String avatarUrl;
    private final String roleZh;
    private final String roleEn;
    private final String bioZh;
    private final String bioEn;
    private final String locationZh;
    private final String locationEn;
    private final String email;
    private final List<String> specialtiesZh;
    private final List<String> specialtiesEn;
    private final String homeAboutTitleZh;
    private final String homeAboutTitleEn;
    private final String homeAboutDescriptionZh;
    private final String homeAboutDescriptionEn;
    private final String homePillarsTitleZh;
    private final String homePillarsTitleEn;
    private final List<String> homePillarsZh;
    private final List<String> homePillarsEn;
    private final String homeJourneyTitleZh;
    private final String homeJourneyTitleEn;
    private final String homeJourneyDescriptionZh;
    private final String homeJourneyDescriptionEn;
    private final String footerProductZh;
    private final String footerProductEn;
    private final String footerStackZh;
    private final String footerStackEn;
    private final long visitCount;

    public AdminSiteSettingsResponse(
        String brandName,
        String avatarUrl,
        String roleZh,
        String roleEn,
        String bioZh,
        String bioEn,
        String locationZh,
        String locationEn,
        String email,
        List<String> specialtiesZh,
        List<String> specialtiesEn,
        String homeAboutTitleZh,
        String homeAboutTitleEn,
        String homeAboutDescriptionZh,
        String homeAboutDescriptionEn,
        String homePillarsTitleZh,
        String homePillarsTitleEn,
        List<String> homePillarsZh,
        List<String> homePillarsEn,
        String homeJourneyTitleZh,
        String homeJourneyTitleEn,
        String homeJourneyDescriptionZh,
        String homeJourneyDescriptionEn,
        String footerProductZh,
        String footerProductEn,
        String footerStackZh,
        String footerStackEn,
        long visitCount
    ) {
        this.brandName = brandName;
        this.avatarUrl = avatarUrl;
        this.roleZh = roleZh;
        this.roleEn = roleEn;
        this.bioZh = bioZh;
        this.bioEn = bioEn;
        this.locationZh = locationZh;
        this.locationEn = locationEn;
        this.email = email;
        this.specialtiesZh = specialtiesZh;
        this.specialtiesEn = specialtiesEn;
        this.homeAboutTitleZh = homeAboutTitleZh;
        this.homeAboutTitleEn = homeAboutTitleEn;
        this.homeAboutDescriptionZh = homeAboutDescriptionZh;
        this.homeAboutDescriptionEn = homeAboutDescriptionEn;
        this.homePillarsTitleZh = homePillarsTitleZh;
        this.homePillarsTitleEn = homePillarsTitleEn;
        this.homePillarsZh = homePillarsZh;
        this.homePillarsEn = homePillarsEn;
        this.homeJourneyTitleZh = homeJourneyTitleZh;
        this.homeJourneyTitleEn = homeJourneyTitleEn;
        this.homeJourneyDescriptionZh = homeJourneyDescriptionZh;
        this.homeJourneyDescriptionEn = homeJourneyDescriptionEn;
        this.footerProductZh = footerProductZh;
        this.footerProductEn = footerProductEn;
        this.footerStackZh = footerStackZh;
        this.footerStackEn = footerStackEn;
        this.visitCount = visitCount;
    }

    public String getBrandName() { return brandName; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getRoleZh() { return roleZh; }
    public String getRoleEn() { return roleEn; }
    public String getBioZh() { return bioZh; }
    public String getBioEn() { return bioEn; }
    public String getLocationZh() { return locationZh; }
    public String getLocationEn() { return locationEn; }
    public String getEmail() { return email; }
    public List<String> getSpecialtiesZh() { return specialtiesZh; }
    public List<String> getSpecialtiesEn() { return specialtiesEn; }
    public String getHomeAboutTitleZh() { return homeAboutTitleZh; }
    public String getHomeAboutTitleEn() { return homeAboutTitleEn; }
    public String getHomeAboutDescriptionZh() { return homeAboutDescriptionZh; }
    public String getHomeAboutDescriptionEn() { return homeAboutDescriptionEn; }
    public String getHomePillarsTitleZh() { return homePillarsTitleZh; }
    public String getHomePillarsTitleEn() { return homePillarsTitleEn; }
    public List<String> getHomePillarsZh() { return homePillarsZh; }
    public List<String> getHomePillarsEn() { return homePillarsEn; }
    public String getHomeJourneyTitleZh() { return homeJourneyTitleZh; }
    public String getHomeJourneyTitleEn() { return homeJourneyTitleEn; }
    public String getHomeJourneyDescriptionZh() { return homeJourneyDescriptionZh; }
    public String getHomeJourneyDescriptionEn() { return homeJourneyDescriptionEn; }
    public String getFooterProductZh() { return footerProductZh; }
    public String getFooterProductEn() { return footerProductEn; }
    public String getFooterStackZh() { return footerStackZh; }
    public String getFooterStackEn() { return footerStackEn; }
    public long getVisitCount() { return visitCount; }
}
