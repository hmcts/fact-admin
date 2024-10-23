@fact-admin-page-bulk-update
Feature: Bulk update of court info

  Scenario: Edit information for closed courts
    When I log in as a super-admin
    When I click bulk update
    Then I am on the "Bulk edit of additional information" page
    Then I check include closed checkbox
    When I add an "Additional Information" in the rich editor field provided "#info_message_ifr"
    And I select court "Aberdare County Court"
    And I select court "Aberdare Magistrates' Court"
    And I click the update button
    Then the message "Court information updated" is displayed on the page

  Scenario: Edit information for open courts
    When I log in as a super-admin
    When I click bulk update
    Then I am on the "Bulk edit of additional information" page
    When I add an "Additional Information" in the rich editor field provided "#info_message_cy_ifr"
    And I select court "Aberdeen Tribunal Hearing Centre"
    And I select court "Aberystwyth Justice Centre"
    And I click the update button
    Then the message "Court information updated" is displayed on the page
