@fact-admin-tab-general
Feature: General Info

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    And I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    And I am logged out if I am a super admin
    And I am on the admin portal sign in page

  Scenario: Admin user can view and update urgent notices and PUAS flag only
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    When I click edit next to court with "stafford-combined-court-centre"
    Then I am redirected to the Edit Court page for the "Stafford Combined Court Centre"
    When I hover over general nav element
    When I click the general tab
    Then I can view the urgent notices
    And I can view the PUAS flag
    And I can view common platform flag checkbox
    And I cannot view super admin content
