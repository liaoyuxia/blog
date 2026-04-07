package com.linstudio.blog.dto;

import java.util.List;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

public class AdminSiteSettingsRequest {
    @NotBlank
    private String brandName;
    private String avatarUrl;
    @NotBlank
    private String roleZh;
    @NotBlank
    private String roleEn;
    @NotBlank
    private String bioZh;
    @NotBlank
    private String bioEn;
    @NotBlank
    private String locationZh;
    @NotBlank
    private String locationEn;
    @Email
    @NotBlank
    private String email;
    @NotEmpty
    private List<String> specialtiesZh;
    @NotEmpty
    private List<String> specialtiesEn;
    @NotBlank
    private String homeAboutTitleZh;
    @NotBlank
    private String homeAboutTitleEn;
    @NotBlank
    private String homeAboutDescriptionZh;
    @NotBlank
    private String homeAboutDescriptionEn;
    @NotBlank
    private String homePillarsTitleZh;
    @NotBlank
    private String homePillarsTitleEn;
    @NotEmpty
    private List<String> homePillarsZh;
    @NotEmpty
    private List<String> homePillarsEn;
    @NotBlank
    private String homeJourneyTitleZh;
    @NotBlank
    private String homeJourneyTitleEn;
    @NotBlank
    private String homeJourneyDescriptionZh;
    @NotBlank
    private String homeJourneyDescriptionEn;
    @NotBlank
    private String footerProductZh;
    @NotBlank
    private String footerProductEn;
    @NotBlank
    private String footerStackZh;
    @NotBlank
    private String footerStackEn;

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getRoleZh() { return roleZh; }
    public void setRoleZh(String roleZh) { this.roleZh = roleZh; }
    public String getRoleEn() { return roleEn; }
    public void setRoleEn(String roleEn) { this.roleEn = roleEn; }
    public String getBioZh() { return bioZh; }
    public void setBioZh(String bioZh) { this.bioZh = bioZh; }
    public String getBioEn() { return bioEn; }
    public void setBioEn(String bioEn) { this.bioEn = bioEn; }
    public String getLocationZh() { return locationZh; }
    public void setLocationZh(String locationZh) { this.locationZh = locationZh; }
    public String getLocationEn() { return locationEn; }
    public void setLocationEn(String locationEn) { this.locationEn = locationEn; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<String> getSpecialtiesZh() { return specialtiesZh; }
    public void setSpecialtiesZh(List<String> specialtiesZh) { this.specialtiesZh = specialtiesZh; }
    public List<String> getSpecialtiesEn() { return specialtiesEn; }
    public void setSpecialtiesEn(List<String> specialtiesEn) { this.specialtiesEn = specialtiesEn; }
    public String getHomeAboutTitleZh() { return homeAboutTitleZh; }
    public void setHomeAboutTitleZh(String homeAboutTitleZh) { this.homeAboutTitleZh = homeAboutTitleZh; }
    public String getHomeAboutTitleEn() { return homeAboutTitleEn; }
    public void setHomeAboutTitleEn(String homeAboutTitleEn) { this.homeAboutTitleEn = homeAboutTitleEn; }
    public String getHomeAboutDescriptionZh() { return homeAboutDescriptionZh; }
    public void setHomeAboutDescriptionZh(String homeAboutDescriptionZh) { this.homeAboutDescriptionZh = homeAboutDescriptionZh; }
    public String getHomeAboutDescriptionEn() { return homeAboutDescriptionEn; }
    public void setHomeAboutDescriptionEn(String homeAboutDescriptionEn) { this.homeAboutDescriptionEn = homeAboutDescriptionEn; }
    public String getHomePillarsTitleZh() { return homePillarsTitleZh; }
    public void setHomePillarsTitleZh(String homePillarsTitleZh) { this.homePillarsTitleZh = homePillarsTitleZh; }
    public String getHomePillarsTitleEn() { return homePillarsTitleEn; }
    public void setHomePillarsTitleEn(String homePillarsTitleEn) { this.homePillarsTitleEn = homePillarsTitleEn; }
    public List<String> getHomePillarsZh() { return homePillarsZh; }
    public void setHomePillarsZh(List<String> homePillarsZh) { this.homePillarsZh = homePillarsZh; }
    public List<String> getHomePillarsEn() { return homePillarsEn; }
    public void setHomePillarsEn(List<String> homePillarsEn) { this.homePillarsEn = homePillarsEn; }
    public String getHomeJourneyTitleZh() { return homeJourneyTitleZh; }
    public void setHomeJourneyTitleZh(String homeJourneyTitleZh) { this.homeJourneyTitleZh = homeJourneyTitleZh; }
    public String getHomeJourneyTitleEn() { return homeJourneyTitleEn; }
    public void setHomeJourneyTitleEn(String homeJourneyTitleEn) { this.homeJourneyTitleEn = homeJourneyTitleEn; }
    public String getHomeJourneyDescriptionZh() { return homeJourneyDescriptionZh; }
    public void setHomeJourneyDescriptionZh(String homeJourneyDescriptionZh) { this.homeJourneyDescriptionZh = homeJourneyDescriptionZh; }
    public String getHomeJourneyDescriptionEn() { return homeJourneyDescriptionEn; }
    public void setHomeJourneyDescriptionEn(String homeJourneyDescriptionEn) { this.homeJourneyDescriptionEn = homeJourneyDescriptionEn; }
    public String getFooterProductZh() { return footerProductZh; }
    public void setFooterProductZh(String footerProductZh) { this.footerProductZh = footerProductZh; }
    public String getFooterProductEn() { return footerProductEn; }
    public void setFooterProductEn(String footerProductEn) { this.footerProductEn = footerProductEn; }
    public String getFooterStackZh() { return footerStackZh; }
    public void setFooterStackZh(String footerStackZh) { this.footerStackZh = footerStackZh; }
    public String getFooterStackEn() { return footerStackEn; }
    public void setFooterStackEn(String footerStackEn) { this.footerStackEn = footerStackEn; }
}
